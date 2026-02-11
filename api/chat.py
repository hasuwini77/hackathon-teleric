"""
Learning Path Agent - Vercel Serverless Function
Adapted for web infrastructure with Neon DB persistence
"""
import os
import json
from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List
from openrouter import OpenRouter
from http.server import BaseHTTPRequestHandler
try:
    from .db import save_conversation, load_conversation, init_db, save_learning_path
    from .schemas import AgentMemorySchema, ChatRequest, ChatResponse, ActionData
except ImportError:
    from db import save_conversation, load_conversation, init_db, save_learning_path
    from schemas import AgentMemorySchema, ChatRequest, ChatResponse, ActionData


# ---------------- Agent Memory ----------------
# Use Pydantic model from schemas
try:
    from .schemas import AgentMemorySchema as AgentMemory
except ImportError:
    from schemas import AgentMemorySchema as AgentMemory


# ---------------- Side Effect Actions ----------------
class ActionType:
    """Types of side effects that can be scheduled"""
    SAVE_LEARNING_PATH = "save_learning_path"
    SEARCH_WEB = "search_web"
    # SEND_COURSE_RECOMMENDATIONS = "send_course_recommendations"
    # GENERATE_PRACTICE_EXERCISES = "generate_practice_exercises"
    # SCHEDULE_FOLLOW_UP = "schedule_follow_up"
    # NOTIFY_MENTOR = "notify_mentor"
    # CREATE_CALENDAR_EVENTS = "create_calendar_events"


# ---------------- Agent ----------------
class LearningPathAgent:
    def __init__(self, client: OpenRouter, model: str, session_id: str):
        self.client = client
        self.model = model
        self.session_id = session_id
        self.memory = AgentMemory()  # Pydantic model with defaults
        self.pending_actions: List[Dict[str, Any]] = []  # Actions to execute after response
        
        # Try to load existing conversation
        existing = load_conversation(session_id)
        if existing:
            self._restore_from_db(existing)
        else:
            self.chat_messages = [
                {"role": "system", "content": self._system_prompt()},
                {"role": "assistant", "content": "Hi! I'm here to help you create a personalized learning path. To get started, could you tell me a bit about yourself and what you're looking to learn?"},
            ]

    def _restore_from_db(self, data: Dict[str, Any]):
        """Restore agent state from database"""
        mem_data = data.get('memory', {})
        
        # Rebuild memory from Pydantic model
        self.memory = AgentMemory(
            objective=mem_data.get('objective'),
            relevant_experience=mem_data.get('relevant_experience'),
            background=mem_data.get('background'),
            skill_level=mem_data.get('skill_level'),
            constraints=mem_data.get('constraints', {}),
            interests=mem_data.get('interests', []),
            learning_path_created=mem_data.get('learning_path_created', False),
            scheduled_actions=mem_data.get('scheduled_actions', [])
        )
        
        self.chat_messages = data.get('chat_history', [])
        self.pending_actions = []
        
        # Ensure system prompt is current
        if self.chat_messages and self.chat_messages[0].get('role') == 'system':
            self.chat_messages[0] = {"role": "system", "content": self._system_prompt()}

    def _system_prompt(self) -> str:
        """Dynamic system prompt based on conversation progress"""
        base = (
            "You are an expert AI learning advisor that helps users build personalized learning paths.\n\n"
            "Your conversation goal:\n"
            "1. Understand what they want to learn (objective)\n"
            "2. Assess their current knowledge and experience\n"
            "3. Understand constraints (time, budget, learning style)\n"
            "4. Create a practical, actionable learning path\n\n"
            "Guidelines:\n"
            "- Be conversational and natural - don't follow a rigid script\n"
            "- Ask follow-up questions when you need clarity\n"
            "- If they provide rich information upfront, don't ask redundant questions\n"
            "- Move to creating the learning path when you have enough context\n"
            "- The learning path should have 3-6 milestones with specific projects and resources\n"
            "- Keep the questions to a minimum and only ask for missing information that is essential to creating a good learning path"
        )

        # Dynamic context based on what we know
        context_parts = []
        
        if self.memory.objective:
            context_parts.append(f"Objective: {self.memory.objective}")
        else:
            context_parts.append("Still need: Clear learning objective")
            
        if self.memory.relevant_experience:
            context_parts.append(f"Experience: {self.memory.relevant_experience}")
        else:
            context_parts.append("Still need: Current skill level and experience")
        
        if self.memory.background:
            context_parts.append(f"Background: {self.memory.background}")
            
        if self.memory.skill_level:
            context_parts.append(f"Skill Level: {self.memory.skill_level}")
            
        if self.memory.interests:
            context_parts.append(f"Interests: {', '.join(self.memory.interests)}")
            
        if self.memory.constraints:
            context_parts.append(f"Constraints: {json.dumps(self.memory.constraints)}")
        
        if self.memory.learning_path_created:
            context_parts.append("✓ Learning path has been created")
        else:
            # Give guidance on what to focus on
            missing = []
            if not self.memory.objective:
                missing.append("learning objective")
            if not self.memory.relevant_experience:
                missing.append("experience level")
            
            if missing:
                context_parts.append(f"Focus on understanding: {', '.join(missing)}")
            elif not self.memory.constraints:
                context_parts.append("Consider asking about time availability or constraints")
            else:
                context_parts.append("Ready to create learning path!")
        
        context = "\n\nCurrent context:\n" + "\n".join(f"- {part}" for part in context_parts)
        
        return base + context

    def _extraction_schema(self) -> Dict[str, Any]:
        """Schema for extracting information from user messages"""
        return {
            "name": "learning_profile",
            "strict": True,
            "schema": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "objective": {"type": ["string", "null"]},
                    "relevant_experience": {"type": ["string", "null"]},
                    "background": {"type": ["string", "null"]},
                    "skill_level": {"type": ["string", "null"]},
                    "interests": {"type": "array", "items": {"type": "string"}},
                    "constraints": {
                        "type": "object",
                        "additionalProperties": True,
                        "properties": {}
                    },
                    "learning_path_detected": {"type": "boolean"}
                },
                "required": ["objective", "relevant_experience", "background", "skill_level", "interests", "constraints", "learning_path_detected"],
            },
        }

    def _extract_messages(self, user_text: str) -> List[Dict[str, str]]:
        """Messages for extraction call"""
        return [
            {
                "role": "system",
                "content": (
                    "Extract structured information from the user's message.\n"
                    "Fill in any new information clearly stated or strongly implied.\n"
                    "Use null for missing strings, [] for empty arrays, {} for empty objects.\n"
                    "Set learning_path_detected to true if the assistant's response contains a structured learning path."
                ),
            },
            {"role": "user", "content": user_text},
        ]

    def _update_memory(self, data: Dict[str, Any]) -> None:
        """Update memory with extracted data, only filling in new information"""
        if data.get("objective") and not self.memory.objective:
            self.memory.objective = data["objective"]
        
        if data.get("relevant_experience") and not self.memory.relevant_experience:
            self.memory.relevant_experience = data["relevant_experience"]
        
        if data.get("background") and not self.memory.background:
            self.memory.background = data["background"]
        
        if data.get("skill_level") and not self.memory.skill_level:
            self.memory.skill_level = data["skill_level"]
        
        if data.get("interests"):
            for interest in data["interests"]:
                if interest and interest not in self.memory.interests:
                    self.memory.interests.append(interest)
        
        if data.get("constraints") and isinstance(data["constraints"], dict):
            self.memory.constraints.update({k: v for k, v in data["constraints"].items() if v is not None})
        
        if data.get("learning_path_detected"):
            self.memory.learning_path_created = True

    def extract_and_update_memory(self, user_text: str, assistant_text: str = "") -> None:
        """Extract information from conversation and update memory"""
        try:
            # Combine user and assistant text for better extraction
            extraction_text = user_text
            if assistant_text and self.memory.learning_path_created is False:
                extraction_text += f"\n\nAssistant response: {assistant_text}"
            
            resp = self.client.chat.send(
                model=self.model,
                messages=self._extract_messages(extraction_text),
                response_format={"type": "json_schema", "json_schema": self._extraction_schema()},
                temperature=0.0,
                max_tokens=400,
            )
            data = json.loads((resp.choices[0].message.content or "").strip())
            self._update_memory(data)
        except Exception:
            # Extraction is best-effort, continue if it fails
            pass

    def _schedule_actions(self) -> None:
        """Determine what side effects should be triggered based on current state"""
        # Clear previous pending actions
        self.pending_actions = []
        
        # When learning path is created, schedule follow-up actions
        if self.memory.learning_path_created and ActionType.SAVE_LEARNING_PATH not in self.memory.scheduled_actions:
            learning_path_content = self._extract_learning_path_from_messages()
            
            # Save to database
            if learning_path_content:
                self._save_learning_path_to_db(learning_path_content)
            
            self.pending_actions.append({
                'type': ActionType.SAVE_LEARNING_PATH,
                'data': {
                    'objective': self.memory.objective,
                    'learning_path': learning_path_content
                }
            })
            self.memory.scheduled_actions.append(ActionType.SAVE_LEARNING_PATH)
            
            # Schedule web search for resources
            self.pending_actions.append({
                'type': ActionType.SEARCH_WEB,
                'data': {
                    'query': f"best courses for {self.memory.objective}",
                    'objective': self.memory.objective,
                    'skill_level': self.memory.skill_level,
                    'interests': self.memory.interests
                }
            })
            self.memory.scheduled_actions.append(ActionType.SEARCH_WEB)
        
        # When we have enough info but no path yet, remind to create it
        if (self.memory.objective and self.memory.relevant_experience and 
            not self.memory.learning_path_created):
            # Could schedule a gentle nudge or prepare resources
            pass

    # TODO - Save course in database and structure this to match the schema better with openrouter
    def _extract_learning_path_from_messages(self) -> Optional[str]:
        """Extract the learning path content from recent messages"""
        # Look for the message where learning path was created
        for msg in reversed(self.chat_messages[-5:]):  # Check last 5 messages
            if msg.get('role') == 'assistant' and len(msg.get('content', '')) > 200:
                # Heuristic: learning paths are typically longer responses
                if any(keyword in msg['content'].lower() for keyword in ['milestone', 'phase', 'step', 'week']):
                    return msg['content']
        return None
    
    def _save_learning_path_to_db(self, learning_path_content: str):
        """Save the learning path to the database"""
        try:
            save_learning_path(
                session_id=self.session_id,
                title=f"Learning Path: {self.memory.objective or 'Custom Path'}",
                description=learning_path_content,
                objective=self.memory.objective
            )
        except Exception as e:
            # Log error but don't fail the request
            print(f"Failed to save learning path: {e}")

    def get_pending_actions(self) -> List[Dict[str, Any]]:
        """Get list of actions that should be executed"""
        return self.pending_actions

    def respond(self, user_text: str) -> str:
        """Process user message and generate response"""
        self.chat_messages.append({"role": "user", "content": user_text})

        # Refresh system prompt with current context
        self.chat_messages[0] = {"role": "system", "content": self._system_prompt()}

        # Generate response
        resp = self.client.chat.send(
            model=self.model,
            messages=self.chat_messages,
            temperature=0.7,
            max_tokens=800,
        )
        assistant_text = (resp.choices[0].message.content or "").strip()
        self.chat_messages.append({"role": "assistant", "content": assistant_text})
        
        # Extract information from the exchange
        self.extract_and_update_memory(user_text, assistant_text)
        
        # Schedule any side effects based on state changes
        self._schedule_actions()
        
        # Persist to database
        self._save_to_db()
        
        return assistant_text

    def _save_to_db(self):
        """Save current state to database"""
        # Use Pydantic's model_dump for serialization
        memory_dict = self.memory.model_dump()
        
        save_conversation(
            self.session_id,
            'active' if not self.memory.learning_path_created else 'completed',
            memory_dict,
            self.chat_messages
        )


# ---------------- Vercel Handler ----------------
class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Parse request
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self._send_error(400, "Empty request body")
                return
                
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8'))
            
            session_id = body.get('session_id')
            user_message = body.get('message', '').strip()
            action = body.get('action', 'chat')  # chat or init
            
            if not session_id:
                self._send_error(400, "session_id is required")
                return
            
            # Initialize DB (idempotent)
            try:
                init_db()
            except Exception as db_error:
                self._send_error(500, f"Database initialization failed: {str(db_error)}")
                return
            
            # Get API key from environment
            api_key = os.environ.get('OPENROUTER_API_KEY')
            if not api_key:
                self._send_error(500, "OPENROUTER_API_KEY not configured")
                return
            
            model = os.environ.get('OPENAI_MODEL', 'openai/gpt-4o-mini')
            
            # Create agent with session
            try:
                with OpenRouter(api_key=api_key) as client:
                    agent = LearningPathAgent(
                        client=client,
                        model=model,
                        session_id=session_id
                    )
                    
                    if action == 'init':
                        # Return initial message
                        initial_message = agent.chat_messages[-1]['content'] if agent.chat_messages else "Hi! I'm here to help you create a personalized learning path. To get started, could you tell me a bit about yourself and what you're looking to learn?"
                        self._send_response({
                            'message': initial_message,
                            'session_id': session_id
                        })
                    else:
                        # Process user message
                        if not user_message:
                            self._send_error(400, "message is required for chat action")
                            return
                        
                        response = agent.respond(user_message)
                        
                        # Get any pending actions that should be executed
                        pending_actions = agent.get_pending_actions()
                        
                        self._send_response({
                            'message': response,
                            'session_id': session_id,
                            'memory': {
                                'objective': agent.memory.objective,
                                'relevant_experience': agent.memory.relevant_experience,
                                'learning_path_created': agent.memory.learning_path_created
                            },
                            'actions': pending_actions  # Side effects to be executed by client
                        })
            except Exception as agent_error:
                self._send_error(500, f"Agent error: {str(agent_error)}")
                return
        
        except json.JSONDecodeError:
            self._send_error(400, "Invalid JSON in request body")
        except Exception as e:
            self._send_error(500, f"Internal error: {str(e)}")
    
    def _send_response(self, data: dict):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def _send_error(self, code: int, message: str):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps({'error': message}).encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
