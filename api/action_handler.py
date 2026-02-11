"""
Action handlers for scheduled side effects
Execute actions returned by the agent
"""
from typing import Dict, Any, List
from api.db import get_db, save_learning_path
from api.models import Session as SessionModel, Goal


class ActionHandler:
    """Handles execution of scheduled actions"""
    
    @staticmethod
    def handle_save_learning_path(session_id: str, data: Dict[str, Any]) -> None:
        """Save learning path to database"""
        try:
            save_learning_path(
                session_id=session_id,
                title=f"Learning Path: {data.get('objective', 'Custom Path')}",
                description=data.get('learning_path', ''),
                objective=data.get('objective')
            )
            print(f"✅ Saved learning path for session {session_id}")
        except Exception as e:
            print(f"❌ Failed to save learning path: {e}")
    
    @staticmethod
    def handle_search_web(session_id: str, data: Dict[str, Any]) -> None:
        """Trigger web search for learning resources"""
        # TODO: Integrate with web search API (Tavily, Perplexity, etc.)
        query = data.get('query', '')
        print(f"🔍 Would search web for: {query}")
        # Results would be stored in a CourseRecommendations table
    
    @staticmethod
    def handle_schedule_follow_up(session_id: str, data: Dict[str, Any]) -> None:
        """Schedule a follow-up notification"""
        # TODO: Integrate with scheduling system (Celery, AWS EventBridge, etc.)
        delay_days = data.get('delay_days', 7)
        message = data.get('message', 'Check-in')
        print(f"📅 Would schedule follow-up in {delay_days} days: {message}")
        # This could create a scheduled job or add to a queue
    
    @staticmethod
    def handle_create_goals(session_id: str, data: Dict[str, Any]) -> None:
        """Create goals from learning path milestones"""
        try:
            milestones = data.get('milestones', [])
            with get_db() as db:
                session = db.query(SessionModel).filter(
                    SessionModel.session_id == session_id
                ).first()
                
                if session:
                    for milestone in milestones:
                        goal = Goal(
                            session_id=session.id,
                            title=milestone.get('title', ''),
                            description=milestone.get('description', ''),
                            target_date=milestone.get('target_date'),
                            completed=False
                        )
                        db.add(goal)
                    print(f"✅ Created {len(milestones)} goals for session {session_id}")
        except Exception as e:
            print(f"❌ Failed to create goals: {e}")
    
    @classmethod
    def execute_actions(cls, session_id: str, actions: List[Dict[str, Any]]) -> None:
        """Execute all scheduled actions"""
        for action in actions:
            action_type = action.get('type')
            action_data = action.get('data', {})
            
            handler_map = {
                'save_learning_path': cls.handle_save_learning_path,
                'search_web': cls.handle_search_web,
                'schedule_follow_up': cls.handle_schedule_follow_up,
                'create_goals': cls.handle_create_goals,
            }
            
            handler = handler_map.get(action_type)
            if handler:
                try:
                    handler(session_id, action_data)
                except Exception as e:
                    print(f"❌ Error executing {action_type}: {e}")
            else:
                print(f"⚠️  Unknown action type: {action_type}")


# Example usage in a background worker or webhook
if __name__ == "__main__":
    # Simulate receiving actions from agent
    actions = [
        {
            'type': 'save_learning_path',
            'data': {
                'objective': 'Learn React',
                'learning_path': '# React Learning Path\n\n## Week 1: Fundamentals...'
            }
        },
        {
            'type': 'search_web',
            'data': {
                'query': 'best React courses for beginners',
                'skill_level': 'beginner'
            }
        }
    ]
    
    ActionHandler.execute_actions('session_123', actions)
