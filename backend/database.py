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

            print(f"[DB] Uploading '{filename}' to Supabase bucket 'resumes' as '{unique_filename}'")

            # Upload to storage with explicit content-type
            storage_response = self.supabase.storage.from_("resumes").upload(
                path=unique_filename,
                file=file_content,
                file_options={"content-type": "application/pdf"},
            )

            print(f"[DB] Storage upload response: {storage_response}")

            # supabase-py raises an exception on error; if we get here, it succeeded
            # Extract text from PDF
            text_content = self._extract_text_from_pdf(file_content)
            print(f"[DB] Extracted {len(text_content)} chars from PDF")

            # Update app_config row (id=1) with file path and extracted text
            update_response = self.supabase.table("app_config").update({
                "resume_file_path": unique_filename,
                "resume_text": text_content
            }).eq("id", 1).execute()

            print(f"[DB] app_config update rows affected: {len(update_response.data)}")

            if len(update_response.data) > 0:
                return {
                    "file_path": unique_filename,
                    "text_content": text_content
                }

            print("[DB] WARNING: Storage uploaded OK but app_config row was not updated (no row with id=1?)")
            return None
        except Exception as e:
            print(f"[DB] Error uploading resume: {type(e).__name__}: {e}")
            raise  # re-raise so the endpoint can return a proper HTTP 500
    
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

    def get_roles(self) -> list:
        """Get all roles from the database."""
        try:
            response = self.supabase.table("roles").select("id, name, description").execute()
            if response.data:
                return response.data
            return []
        except Exception as e:
            print(f"Error getting roles: {e}")
            return []

    def get_role(self, identifier: str) -> Optional[Dict[str, Any]]:
        """Get a single role by id or name from the database."""
        try:
            # Try matching by id (if uuid) or name
            import uuid
            try:
                val = uuid.UUID(identifier)
                response = self.supabase.table("roles").select("id, name, description").eq("id", identifier).execute()
            except ValueError:
                # Fallback to loose name match 
                # (in realistic apps, slug might be better, we use ilike for loose match)
                response = self.supabase.table("roles").select("id, name, description").ilike("name", f"%{identifier}%").execute()
                
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error getting role {identifier}: {e}")
            return None

    def get_companies(self) -> list:
        """Get all companies from the database."""
        try:
            response = self.supabase.table("companies").select("name").execute()
            if response.data:
                return response.data
            return []
        except Exception as e:
            print(f"Error getting companies: {e}")
            return []

    def delete_resume(self) -> bool:
        """Delete resume from storage and clear database fields."""
        try:
            # 1. Get current file path
            data = self.get_user_data()
            if not data or not data.get("resume_file_path"):
                return True # Already empty
            
            file_path = data["resume_file_path"]
            
            # 2. Delete from storage if exists
            try:
                self.supabase.storage.from_("resumes").remove([file_path])
            except Exception as e:
                print(f"[DB] Storage removal warning: {e}")
            
            # 3. Clear DB fields
            self.supabase.table("app_config").update({
                "resume_file_path": None,
                "resume_text": None
            }).eq("id", 1).execute()
            
            return True
        except Exception as e:
            print(f"[DB] Error deleting resume: {e}")
            return False

# Global instance
db_manager = DatabaseManager()
