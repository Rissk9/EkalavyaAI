"""
Supabase database operations for single-user mode.
All operations work with app_config table where id = 1.
"""
import uuid
from typing import Optional, Dict, Any
from supabase import create_client, Client
from backend.config import get_settings
from langchain_community.document_loaders import PyPDFLoader


class DatabaseManager:
    def __init__(self):
        settings = get_settings()
        print(f"Supabase URL: {settings.supabase_url}")
        print(f"Supabase Key exists: {bool(settings.supabase_key)}")
        self.supabase: Client = create_client(settings.supabase_url, settings.supabase_key)
    
    def update_usernames(self, github_username: str, leetcode_username: str) -> bool:
        """Update GitHub and LeetCode usernames in app_config."""
        try:
            print(f"Updating usernames: github={github_username}, leetcode={leetcode_username}")
            response = self.supabase.table("app_config").update({
                "github_username": github_username,
                "leetcode_username": leetcode_username
            }).eq("id", 1).execute()
            
            print(f"Update response: {response}")
            print(f"Response data length: {len(response.data) if response.data else 0}")
            return len(response.data) > 0
        except Exception as e:
            print(f"Error updating usernames: {e}")
            return False
    
    def upload_resume(self, file_content: bytes, filename: str) -> Optional[Dict[str, Any]]:
        """Upload resume to Supabase Storage and extract text."""
        try:
            # Generate unique filename
            file_ext = filename.split('.')[-1] if '.' in filename else 'pdf'
            unique_filename = f"resume/{uuid.uuid4()}.{file_ext}"
            
            # Upload to storage (resumes bucket already exists)
            storage_response = self.supabase.storage.from_("resumes").upload(
                unique_filename, file_content
            )
            
            if storage_response:
                # Extract text from PDF
                text_content = self._extract_text_from_pdf(file_content)
                
                # Update app_config with file path and extracted text
                update_response = self.supabase.table("app_config").update({
                    "resume_file_path": unique_filename,
                    "resume_text": text_content
                }).eq("id", 1).execute()
                
                if len(update_response.data) > 0:
                    return {
                        "file_path": unique_filename,
                        "text_content": text_content
                    }
            
            return None
        except Exception as e:
            print(f"Error uploading resume: {e}")
            return None
    
    def _extract_text_from_pdf(self, file_content: bytes) -> str:
        """Extract text from PDF bytes using LangChain."""
        try:
            # Save bytes to temporary file
            import tempfile
            import os
            
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                tmp_file.write(file_content)
                tmp_file_path = tmp_file.name
            
            try:
                # Use LangChain PyPDFLoader to extract text
                loader = PyPDFLoader(tmp_file_path)
                pages = loader.load()
                
                # Combine all page content
                text_content = ""
                for page in pages:
                    text_content += page.page_content + "\n"
                
                return text_content.strip()
            finally:
                # Clean up temporary file
                os.unlink(tmp_file_path)
                
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return ""
    
    def get_user_data(self) -> Optional[Dict[str, Any]]:
        """Get user data from app_config table."""
        try:
            response = self.supabase.table("app_config").select("*").eq("id", 1).execute()
            
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error getting user data: {e}")
            return None


# Global instance
db_manager = DatabaseManager()
