"""
ADVANCED ATS SCORING SYSTEM
Comprehensive resume evaluation with semantic understanding, skill weighting,
experience analysis, and job fit assessment.

Features:
- Semantic skill matching (understands ML = Machine Learning)
- Weighted skill importance (Python > HTML for SDE roles)
- Experience level assessment (years, progression, seniority)
- Project impact analysis (quantified results vs generic descriptions)
- Resume structure validation (ATS-friendly formatting)
- Company & role-specific matching
- Skill gap identification with recommendations
"""

import re
import json
from typing import Dict, List, Tuple, Optional
from collections import Counter
from dataclasses import dataclass, asdict
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ============================================================================
# SKILL DEFINITIONS & MAPPINGS
# ============================================================================

# Skill synonyms for semantic matching
SKILL_SYNONYMS = {
    # Programming Languages
    "python": ["py", "python3", "python 3"],
    "javascript": ["js", "node", "nodejs", "node.js"],
    "java": ["jdk", "jvm"],
    "c++": ["cpp", "c plus plus"],
    "golang": ["go", "golang"],
    "rust": ["rs"],
    
    # Web Technologies
    "react": ["reactjs", "react.js"],
    "angular": ["angularjs", "angular.js"],
    "vue": ["vuejs", "vue.js"],
    "django": ["django rest"],
    "fastapi": ["fast api"],
    "flask": ["flask rest"],
    
    # Databases
    "sql": ["mysql", "postgres", "postgresql", "sql server"],
    "mongodb": ["mongo"],
    "nosql": ["non relational"],
    "elasticsearch": ["elastic search"],
    "redis": ["redis cache"],
    
    # Cloud Platforms
    "aws": ["amazon web services", "ec2", "s3", "lambda"],
    "gcp": ["google cloud", "google cloud platform"],
    "azure": ["microsoft azure"],
    
    # DevOps & Tools
    "docker": ["containers", "containerization"],
    "kubernetes": ["k8s"],
    "ci/cd": ["cicd", "continuous integration", "continuous deployment"],
    "git": ["github", "gitlab", "gitops"],
    
    # AI/ML
    "machine learning": ["ml", "deep learning", "neural networks"],
    "tensorflow": ["tf"],
    "pytorch": ["torch"],
    "nlp": ["natural language processing"],
    "computer vision": ["cv", "image processing"],
    
    # Concepts
    "data structures": ["dsa", "algorithms"],
    "system design": ["distributed systems", "scalability"],
    "api design": ["rest", "restful", "graphql"],
    "microservices": ["microservice architecture"],
}

# Skill importance weights by role type
SKILL_WEIGHTS_BY_ROLE = {
    "backend_engineer": {
        "python": 0.12,
        "java": 0.10,
        "javascript": 0.08,
        "sql": 0.10,
        "api design": 0.09,
        "microservices": 0.08,
        "system design": 0.10,
        "data structures": 0.09,
        "docker": 0.07,
        "aws": 0.08,
        "ci/cd": 0.06,
        "git": 0.04,
    },
    "frontend_engineer": {
        "javascript": 0.15,
        "react": 0.12,
        "html": 0.08,
        "css": 0.08,
        "typescript": 0.10,
        "data structures": 0.08,
        "api design": 0.07,
        "git": 0.06,
        "testing": 0.06,
        "ui/ux": 0.07,
        "responsive design": 0.06,
    },
    "data_scientist": {
        "python": 0.14,
        "machine learning": 0.14,
        "sql": 0.09,
        "data structures": 0.08,
        "tensorflow": 0.07,
        "pytorch": 0.07,
        "nlp": 0.06,
        "computer vision": 0.06,
        "statistics": 0.08,
        "pandas": 0.06,
        "numpy": 0.05,
    },
    "devops_engineer": {
        "docker": 0.12,
        "kubernetes": 0.12,
        "aws": 0.12,
        "ci/cd": 0.12,
        "linux": 0.10,
        "terraform": 0.08,
        "monitoring": 0.07,
        "python": 0.08,
        "bash": 0.07,
        "git": 0.06,
    },
    "data_engineer": {
        "sql": 0.12,
        "python": 0.12,
        "data structures": 0.08,
        "etl": 0.10,
        "spark": 0.10,
        "kafka": 0.08,
        "aws": 0.09,
        "hadoop": 0.07,
        "data modeling": 0.08,
        "cloud": 0.08,
    },
}

# Seniority level indicators
SENIORITY_INDICATORS = {
    "intern": ["intern", "internship"],
    "junior": ["junior", "associate", "graduate", "entry level"],
    "mid": ["mid-level", "intermediate", "mid level"],
    "senior": ["senior", "lead", "principal", "architect"],
    "staff": ["staff engineer", "principal engineer"],
}

# High-impact keywords (indicate quality)
HIGH_IMPACT_KEYWORDS = [
    "architected", "led", "designed", "implemented", "optimized",
    "scaled", "reduced", "increased", "improved", "built",
    "developed", "created", "deployed", "launched", "managed",
    "directed", "mentored", "reviewed"
]

# Quantification indicators (measurable impact)
QUANTIFICATION_INDICATORS = [
    r"\d+%", r"\d+x", r"\$\d+", r"\d+ users", r"\d+ requests",
    r"\d+ qps", r"\d+ downloads", r"increased\s+\w+\s+by",
    r"improved\s+\w+\s+to", r"reduced\s+\w+\s+from"
]

from langchain_community.document_loaders import PyPDFLoader
import os

class DocumentProcessor:
    """Handles extracting text from uploaded resume files."""
    
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Could not find the file: {file_path}")
            
        try:
            loader = PyPDFLoader(file_path)
            docs = loader.load()
            
            # Combine all pages into a single string separated by double newlines
            text = "\n\n".join([doc.page_content for doc in docs])
            
            # Basic cleanup: remove excessive horizontal whitespace
            import re
            # Replace multiple horizontal spaces with single space
            text = re.sub(r'[^\S\r\n]+', ' ', text)
            # Normalize line endings
            text = text.replace('\r\n', '\n').strip()
            
            return text
        except Exception as e:
            print(f"Error reading PDF: {e}")
            return ""

# ============================================================================
# FASTAPI APP
# ============================================================================

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tempfile
import uvicorn

app = FastAPI(
    title="Advanced ATS Scoring API",
    description="Upload a resume PDF and get a detailed ATS score breakdown.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ComponentBreakdown(BaseModel):
    total_score: float          # out of 10
    skill_match: float          # out of 100
    experience_quality: float   # out of 100
    project_quality: float      # out of 100
    resume_structure: float     # out of 100
    job_relevance: float        # out of 100


class ATSResponse(BaseModel):
    component_breakdown: ComponentBreakdown
    matched_skills: List[str]
    missing_critical_skills: List[str]
    gaps_identified: List[str]
    recommendations: List[str]


@app.post("/score", response_model=ATSResponse)
async def score_resume(
    resume: UploadFile = File(..., description="Resume PDF file"),
    job_description: str = Form(default="", description="Job description text"),
    role_type: str = Form(
        default="backend_engineer",
        description="Role type: backend_engineer, frontend_engineer, data_scientist, devops_engineer, data_engineer"
    )
):
    """
    Upload a resume PDF and receive an ATS score breakdown.
    
    - **resume**: PDF file of the resume
    - **job_description**: Text of the job description (optional but improves relevance score)
    - **role_type**: Target role type for skill weighting
    """
    if resume.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    # Save uploaded file to a temp location
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        contents = await resume.read()
        tmp.write(contents)
        tmp_path = tmp.name

    # Extract text
    processor = DocumentProcessor()
    resume_text = processor.extract_text_from_pdf(tmp_path)

    # Clean up temp file
    import os
    try:
        os.unlink(tmp_path)
    except Exception:
        pass

    if not resume_text:
        raise HTTPException(status_code=422, detail="Could not extract text from the PDF. Ensure it is not a scanned/image PDF.")

    # Run scoring
    scorer = AdvancedATSScorer(role_type=role_type)
    result = scorer.score(resume_text=resume_text, job_description=job_description)

    return ATSResponse(
        component_breakdown=ComponentBreakdown(
            total_score=result.total_score,
            skill_match=result.skill_match_score,
            experience_quality=result.experience_score,
            project_quality=result.project_quality_score,
            resume_structure=result.structure_score,
            job_relevance=result.relevance_score,
        ),
        matched_skills=result.matched_skills,
        missing_critical_skills=result.missing_critical_skills,
        gaps_identified=result.gaps,
        recommendations=result.recommendations,
    )


@app.get("/health")
def health():
    return {"status": "ok"}


# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class SkillMatch:
    """Represents a matched skill"""
    skill: str
    found_in_resume: str
    importance_weight: float
    normalized_score: float
    confidence: float

@dataclass
class ExperienceAnalysis:
    """Analysis of candidate's experience"""
    total_years: float
    companies: List[str]
    roles: List[str]
    seniority_level: str
    job_progression: str  # ascending, flat, mixed
    average_tenure_years: float
    relevant_experience_years: float
    achievement_density: float  # high-impact keywords per 100 words

@dataclass
class ProjectAnalysis:
    """Analysis of candidate's projects"""
    project_count: int
    avg_description_length: float
    quantified_projects: int
    impact_density: float  # impact keywords per 100 words
    technologies_per_project: float
    clarity_score: float  # how well described

@dataclass
class ResumeStructure:
    """Analysis of resume structure and formatting"""
    has_contact_info: bool
    has_professional_summary: bool
    has_experience_section: bool
    has_education_section: bool
    has_skills_section: bool
    has_projects_section: bool
    formatting_score: float  # 0-100
    ats_friendliness_score: float  # 0-100

@dataclass
class ATSScoreBreakdown:
    """Complete ATS score with breakdown"""
    total_score: float
    skill_match_score: float
    experience_score: float
    project_quality_score: float
    structure_score: float
    relevance_score: float
    
    skill_details: Dict
    experience_details: Dict
    project_details: Dict
    structure_details: Dict
    relevance_details: Dict
    gaps: List[str]
    recommendations: List[str]
    matched_skills: List[str]
    missing_critical_skills: List[str]

# ============================================================================
# SKILL MATCHING ENGINE
# ============================================================================

class SkillMatcher:
    """Advanced skill matching with semantic understanding"""
    
    def __init__(self, role_type: str = "backend_engineer"):
        self.role_type = role_type
        self.skill_weights = SKILL_WEIGHTS_BY_ROLE.get(
            role_type, 
            SKILL_WEIGHTS_BY_ROLE["backend_engineer"]
        )
        self.all_skills = set(self.skill_weights.keys())
    
    def normalize_skill_name(self, skill: str) -> Optional[str]:
        """
        Normalize skill name by checking synonyms.
        Returns canonical skill name or None if not recognized.
        """
        skill_lower = skill.lower().strip()
        
        # Direct match
        if skill_lower in self.skill_weights:
            return skill_lower
        
        # Check synonyms
        for canonical, synonyms in SKILL_SYNONYMS.items():
            if skill_lower in synonyms:
                # Only return if this canonical is in our role weights
                if canonical in self.skill_weights:
                    return canonical
        
        return None
    
    def extract_skills_from_text(self, text: str) -> List[Tuple[str, int]]:
        """
        Extract skill occurrences from resume text.
        Returns list of (skill, occurrence_count) tuples.
        """
        text_lower = text.lower()
        skill_matches = []
        
        # Check direct skill mentions
        for skill in self.all_skills:
            count = text_lower.count(skill)
            if count > 0:
                skill_matches.append((skill, count))
        
        # Check synonyms
        for canonical, synonyms in SKILL_SYNONYMS.items():
            if canonical in self.skill_weights:
                for synonym in synonyms:
                    count = text_lower.count(synonym)
                    if count > 0:
                        # Aggregate with canonical
                        existing = next(
                            ((i, s) for i, (s, _) in enumerate(skill_matches) 
                             if s == canonical), 
                            None
                        )
                        if existing:
                            idx, skill = existing
                            skill_matches[idx] = (skill, skill_matches[idx][1] + count)
                        else:
                            skill_matches.append((canonical, count))
        
        return skill_matches
    
    def score_skills(self, resume_text: str, jd_keywords: List[str] = None) -> Tuple[float, Dict]:
        """
        Score resume based on skill match to role, with JD keyword boosting.
        
        Returns:
            - skill_score (0-100)
            - detailed breakdown
        """
        found_skills = self.extract_skills_from_text(resume_text)
        
        # Calculate scores with weights
        total_weight = sum(self.skill_weights.values())
        if jd_keywords:
            # Add dynamic weights for JD keywords
            jd_weight_total = len(jd_keywords) * 0.1  # Arbitrary weight for each JD keyword
            total_weight += jd_weight_total

        matched_score = 0
        matched_details = {}
        
        for skill, count in found_skills:
            weight = self.skill_weights.get(skill, 0.05) # Small base weight if not in role
            
            # Boost if found in JD
            if jd_keywords and skill in jd_keywords:
                weight += 0.5 # SIGNIFICANT BOOST from previous 0.1
            
            matched_score += min(count, 3) * weight * 20 # Up to 3 mentions count
            matched_details[skill] = {
                "count": count,
                "weight": weight
            }
            
        # Normalize and cap
        skill_score = min((matched_score / total_weight) * 10, 100) if total_weight > 0 else 0
        
        return skill_score, {
            "matched_skills": matched_details,
            "total_matched": len(found_skills),
            "missing_skills": {s: w for s, w in self.skill_weights.items() if s not in matched_details}
        }
        skill_matches = self.extract_skills_from_text(resume_text)
        
        matched_skills = {}
        skill_coverage = {}
        
        for skill, occurrence_count in skill_matches:
            weight = self.skill_weights.get(skill, 0)
            if weight > 0:
                # Confidence increases with mentions (up to 3 mentions = max confidence)
                confidence = min(occurrence_count / 3, 1.0)
                matched_skills[skill] = {
                    "weight": weight,
                    "occurrences": occurrence_count,
                    "confidence": confidence,
                    "weighted_score": weight * confidence
                }
        
        # Calculate coverage for each skill type
        total_weight = sum(self.skill_weights.values())
        matched_weight = sum(
            m["weighted_score"] for m in matched_skills.values()
        )
        
        skill_coverage = matched_weight / total_weight if total_weight > 0 else 0
        skill_score = skill_coverage * 100
        
        missing_skills = {
            skill: weight 
            for skill, weight in self.skill_weights.items() 
            if skill not in matched_skills
        }
        missing_skills = dict(
            sorted(
                missing_skills.items(), 
                key=lambda x: x[1], 
                reverse=True
            )[:5]  # Top 5 missing skills
        )
        
        return skill_score, {
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "coverage_percentage": round(skill_coverage * 100, 2),
            "total_matched": len(matched_skills),
            "total_required": len(self.skill_weights)
        }

# ============================================================================
# EXPERIENCE ANALYZER
# ============================================================================

class ExperienceAnalyzer:
    """Analyze candidate's professional experience"""
    
    def analyze(self, resume_text: str, role_keywords: List[str]) -> Tuple[float, Dict]:
        """
        Analyze professional experience section.
        
        Scoring factors:
        - Total years of experience
        - Relevant experience (matches role keywords)
        - Job progression (ascending = better)
        - Achievement density (high-impact keywords)
        - Tenure stability
        """
        
        # Extract experience section
        exp_section = self._extract_section(
            resume_text, 
            ["experience", "professional experience", "work experience"]
        )
        
        if not exp_section:
            return 30, {"note": "No dedicated experience section found — base score awarded"}
        
        # Parse job entries
        jobs = self._parse_jobs(exp_section)
        
        if not jobs:
            return 30, {"note": "Could not parse job entries — base score awarded"}
        
        # Calculate metrics
        total_years = self._calculate_total_years(jobs)
        seniority = self._detect_seniority(jobs, resume_text)
        progression = self._assess_job_progression(jobs)
        relevant_years = self._calculate_relevant_years(jobs, role_keywords)
        achievement_density = self._calculate_achievement_density(exp_section)
        
        # Score components (normalized 0-100) — lenient thresholds
        years_score = min(total_years / 3 * 100, 100)  # 3 years = 100 (was 5)
        seniority_score = self._seniority_to_score(seniority)
        progression_score = {"ascending": 100, "flat": 75, "mixed": 80}.get(
            progression, 60
        )
        
        # Weighted final score with base boost for having experience at all
        base_boost = 15
        experience_score = base_boost + (
            years_score * 0.22 +
            seniority_score * 0.23 +
            progression_score * 0.18 +
            relevant_years * 0.22
        )
        experience_score = min(experience_score, 100)
        
        return experience_score, {
            "total_years": round(total_years, 1),
            "relevant_years": round(relevant_years, 1),
            "seniority_level": seniority,
            "job_progression": progression,
            "achievement_density": round(achievement_density, 2),
            "company_count": len(set(j.get("company", "") for j in jobs if j.get("company"))),
            "years_score": round(years_score, 1),
            "seniority_score": round(seniority_score, 1),
            "progression_score": round(progression_score, 1),
        }
    
    @staticmethod
    def _extract_section(text: str, section_names: List[str]) -> str:
        """Extract a section from resume by common headers"""
        text_lower = text.lower()
        for section in section_names:
            if section in text_lower:
                start = text_lower.find(section)
                # Find next major section or end of text
                next_section = len(text)
                for next_sec in ["education", "skills", "projects", "certifications"]:
                    pos = text_lower.find(next_sec, start + len(section))
                    if pos != -1:
                        next_section = min(next_section, pos)
                return text[start:next_section]
        return ""
    
    @staticmethod
    def _parse_jobs(exp_text: str) -> List[Dict]:
        """Parse job entries from experience section"""
        jobs = []
        
        # Simple heuristic: job entries usually have company and dates
        # This is basic - could be enhanced with NLP
        lines = exp_text.split('\n')
        current_job = {}
        
        for line in lines:
            if re.search(r'\d{4}|\d{1,2}/\d{1,2}', line):  # Contains date
                if current_job:
                    jobs.append(current_job)
                current_job = {"description": line}
            elif current_job:
                current_job["description"] += " " + line
        
        if current_job:
            jobs.append(current_job)
        
        return jobs
    
    @staticmethod
    def _calculate_total_years(jobs: List[Dict]) -> float:
        """Estimate total years of experience"""
        # Look for year patterns in job descriptions
        years = []
        for job in jobs:
            desc = job.get("description", "")
            year_matches = re.findall(r'(\d{4})\s*[-–]\s*(\d{4}|present|now)', desc)
            if year_matches:
                start, end = year_matches[0]
                end_year = 2024 if end.lower() in ["present", "now"] else int(end)
                start_year = int(start)
                years.append(end_year - start_year)
        
        return sum(years) if years else len(jobs)  # Fallback: 1 year per job
    
    @staticmethod
    def _detect_seniority(jobs: List[Dict], text: str) -> str:
        """Detect seniority level from job titles and text"""
        text_lower = text.lower()
        
        for level, indicators in SENIORITY_INDICATORS.items():
            for indicator in indicators:
                if indicator in text_lower:
                    return level
        
        # Default based on number of jobs
        num_jobs = len(jobs)
        if num_jobs >= 5:
            return "senior"
        elif num_jobs >= 3:
            return "mid"
        elif num_jobs >= 1:
            return "junior"
        return "intern"
    
    @staticmethod
    def _assess_job_progression(jobs: List[Dict]) -> str:
        """Assess if career progression is ascending, flat, or mixed"""
        if len(jobs) < 2:
            return "flat"
        
        # Simple heuristic: check if titles/companies indicate progression
        # (This could be enhanced with NLP)
        seniority_keywords = {
            "senior": 3,
            "lead": 3,
            "principal": 3,
            "mid": 2,
            "junior": 1,
            "intern": 0
        }
        
        scores = []
        for job in jobs:
            desc = job.get("description", "").lower()
            score = max(
                [seniority_keywords.get(kw, 1) for kw in seniority_keywords 
                 if kw in desc]
            ) if any(kw in desc for kw in seniority_keywords) else 1
            scores.append(score)
        
        if len(scores) >= 2:
            if scores[-1] > scores[0]:
                return "ascending"
            elif scores[-1] == scores[0]:
                return "flat"
            else:
                return "mixed"
        
        return "flat"
    
    @staticmethod
    def _calculate_relevant_years(jobs: List[Dict], role_keywords: List[str]) -> float:
        """Calculate years of relevant experience"""
        role_keywords_lower = [kw.lower() for kw in role_keywords]
        relevant_years = 0
        
        for job in jobs:
            desc = job.get("description", "").lower()
            if any(kw in desc for kw in role_keywords_lower):
                relevant_years += 1
        
        return min(relevant_years, 15)  # Cap at 15 years
    
    @staticmethod
    def _calculate_achievement_density(text: str) -> float:
        """Calculate density of high-impact keywords"""
        text_lower = text.lower()
        word_count = len(text.split())
        
        impact_count = sum(
            text_lower.count(kw) for kw in HIGH_IMPACT_KEYWORDS
        )
        
        return (impact_count / word_count * 100) if word_count > 0 else 0
    
    @staticmethod
    def _seniority_to_score(seniority: str) -> float:
        """Convert seniority level to score"""
        return {
            "intern": 20,
            "junior": 40,
            "mid": 70,
            "senior": 90,
            "staff": 100
        }.get(seniority, 50)

# ============================================================================
# PROJECT ANALYZER
# ============================================================================

class ProjectAnalyzer:
    """Analyze candidate's projects section"""
    
    def analyze(self, resume_text: str) -> Tuple[float, Dict]:
        """
        Analyze projects section.
        
        Scoring factors:
        - Number of projects
        - Description quality (length, detail)
        - Quantified results
        - Technology usage
        - Impact demonstration
        """
        
        # Extract projects section
        projects_section = ExperienceAnalyzer._extract_section(
            resume_text,
            ["projects", "project experience", "personal projects", "academic projects"]
        )
        
        if not projects_section:
            return 25, {"note": "No projects section found — base score awarded"}
        
        # Parse individual projects
        projects = self._parse_projects(projects_section)
        
        if not projects:
            return 25, {"note": "Could not parse projects — base score awarded"}
        
        # Analyze each project
        project_scores = []
        quantified_count = 0
        impact_density = 0
        
        for project in projects:
            desc = project.get("description", "")
            
            # Check if quantified
            has_metrics = bool(re.findall(
                r'|'.join(QUANTIFICATION_INDICATORS), 
                desc
            ))
            if has_metrics:
                quantified_count += 1
            
            # Score individual project
            project_score = self._score_project(desc)
            project_scores.append(project_score)
            
            # Accumulate impact keywords
            impact_count = sum(1 for kw in HIGH_IMPACT_KEYWORDS if kw in desc.lower())
            impact_density += impact_count
        
        # Aggregate scores
        avg_project_score = np.mean(project_scores) if project_scores else 0
        impact_density = (impact_density / len(projects) / 10) if projects else 0
        
        # Final project score (0-100) — lenient with base boost
        base_boost = 20
        project_score = base_boost + (
            avg_project_score * 0.35 +
            (quantified_count / len(projects) * 100) * 0.25 +
            impact_density * 100 * 0.20
        )
        project_score = min(project_score, 100)
        
        return project_score, {
            "project_count": len(projects),
            "avg_description_quality": round(avg_project_score, 1),
            "quantified_projects": quantified_count,
            "quantified_percentage": round(quantified_count / len(projects) * 100 if projects else 0, 1),
            "impact_density": round(impact_density, 2),
        }
    
    @staticmethod
    def _parse_projects(text: str) -> List[Dict]:
        """Parse individual projects from projects section"""
        projects = []
        
        # If we have clear double newlines, use them
        if '\n\n' in text:
            project_lines = re.split(r'[\n]{2,}', text)
            for project_text in project_lines:
                if project_text.strip():
                    projects.append({"description": project_text})
            return projects
            
        lines = text.split('\n')
        current_project = ''
        
        for line in lines:
            line_str = line.strip()
            if not line_str or line_str.lower() in ['projects', 'personal projects', 'academic projects']:
                continue
                
            # Stop if we hit achievements or another section
            if line_str.lower() in ['achievements', 'certifications', 'education']:
                break
                
            is_bullet = bool(re.match(r'^[\u2022\-\*]', line_str))
            has_title_sep = bool(re.search(r'(\||–| - | \- )', line_str))
            
            is_title = (not is_bullet) and has_title_sep
            
            if is_title:
                if current_project.strip():
                    projects.append({"description": current_project.strip()})
                current_project = line_str + '\n'
            else:
                current_project += line_str + '\n'
                
        if current_project.strip():
            projects.append({"description": current_project.strip()})
            
        # If the heuristic failed, fallback to treating the block as 1 project
        if not projects:
            projects.append({"description": text})
            
        return projects
    
    @staticmethod
    def _score_project(description: str) -> float:
        """Score a single project description"""
        score = 0
        
        # Length (longer = more detail) — lenient thresholds
        words = len(description.split())
        if words >= 30:
            score += 30
        elif words >= 15:
            score += 25
        elif words >= 5:
            score += 15
        
        # Impact keywords
        impact_count = sum(1 for kw in HIGH_IMPACT_KEYWORDS if kw in description.lower())
        score += min(impact_count * 10, 30)
        
        # Technologies mentioned
        tech_keywords = ["python", "javascript", "java", "react", "aws", "docker", "ai", "ml"]
        tech_count = sum(1 for tech in tech_keywords if tech in description.lower())
        score += min(tech_count * 5, 25)
        
        # Quantification
        if re.search(r'|'.join(QUANTIFICATION_INDICATORS), description):
            score += 15
        
        return min(score, 100)

# ============================================================================
# RESUME STRUCTURE ANALYZER
# ============================================================================

class ResumeStructureAnalyzer:
    """Analyze resume formatting and ATS-friendliness"""
    
    def analyze(self, resume_text: str) -> Tuple[float, Dict]:
        """
        Analyze resume structure and ATS compatibility.
        
        Checks:
        - Presence of key sections
        - Formatting quality
        - ATS-friendliness
        """
        
        text_lower = resume_text.lower()
        
        # Check for key sections
        has_contact = bool(re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', resume_text))
        has_summary = "summary" in text_lower or "objective" in text_lower
        has_experience = "experience" in text_lower
        has_education = "education" in text_lower
        has_skills = "skills" in text_lower
        has_projects = "projects" in text_lower or "portfolio" in text_lower
        
        # Formatting checks
        line_count = len(resume_text.split('\n'))
        word_count = len(resume_text.split())
        
        # ATS checks (no fancy formatting)
        has_tables = bool(re.search(r'[\|]+', resume_text))
        has_images = "image" in text_lower or "photo" in text_lower
        has_columns = bool(re.search(r'column', text_lower))
        
        # Calculate scores
        section_score = sum([
            has_contact, has_summary, has_experience, 
            has_education, has_skills, has_projects
        ]) / 6 * 100
        
        formatting_score = 100
        if has_tables:
            formatting_score -= 15
        if has_images:
            formatting_score -= 10
        if has_columns:
            formatting_score -= 10
        
        # Check page length (1-2 pages is ideal)
        lines_per_page = 50
        page_count = line_count / lines_per_page
        if 1 <= page_count <= 2:
            ats_score = 100
        elif page_count < 1:
            ats_score = 80
        elif page_count > 3:
            ats_score = 70
        else:
            ats_score = 85
        
        # Penalize common ATS issues
        if not has_contact:
            ats_score -= 10
        if word_count < 200:
            ats_score -= 10
        
        structure_score = (section_score * 0.5 + formatting_score * 0.3 + ats_score * 0.2)
        
        return structure_score, {
            "has_contact_info": has_contact,
            "has_summary": has_summary,
            "has_experience": has_experience,
            "has_education": has_education,
            "has_skills": has_skills,
            "has_projects": has_projects,
            "sections_score": round(section_score, 1),
            "formatting_score": round(formatting_score, 1),
            "ats_friendliness_score": round(ats_score, 1),
            "page_count": round(page_count, 1),
            "total_word_count": word_count,
        }

# ============================================================================
# RELEVANCE ANALYZER
# ============================================================================

class RelevanceAnalyzer:
    """Analyze how relevant resume is to the job description"""
    
    @staticmethod
    def analyze(resume_text: str, job_description: str) -> Tuple[float, Dict]:
        """
        Use semantic similarity to assess job relevance.
        
        Uses TF-IDF + cosine similarity for semantic matching.
        """
        
        # Clean texts
        resume_clean = RelevanceAnalyzer._clean_text(resume_text)
        job_clean = RelevanceAnalyzer._clean_text(job_description)
        
        # Vectorize
        try:
            vectorizer = TfidfVectorizer(
                max_features=500,
                stop_words='english',
                ngram_range=(1, 2)
            )
            
            docs = [resume_clean, job_clean]
            tfidf = vectorizer.fit_transform(docs)
            
            # Calculate similarity
            similarity = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
            relevance_score = similarity * 100
            
        except Exception as e:
            print(f"Warning: Similarity calculation failed: {e}")
            relevance_score = 50  # Default neutral score
        
        return relevance_score, {
            "semantic_similarity": round(similarity * 100 if 'similarity' in locals() else 50, 1),
            "analysis": "High relevance" if relevance_score > 70 else "Medium relevance" if relevance_score > 50 else "Low relevance"
        }
    
    @staticmethod
    def _clean_text(text: str) -> str:
        """Clean text for similarity analysis"""
        text = text.lower()
        # Remove email, phone, special chars but keep words
        text = re.sub(r'[^a-z0-9\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

# ============================================================================
# MAIN ATS SCORER
# ============================================================================

class AdvancedATSScorer:
    """Complete ATS scoring system"""
    
    def __init__(self, role_type: str = "backend_engineer"):
        self.role_type = role_type
        self.skill_matcher = SkillMatcher(role_type)
        self.experience_analyzer = ExperienceAnalyzer()
        self.project_analyzer = ProjectAnalyzer()
        self.structure_analyzer = ResumeStructureAnalyzer()
        self.relevance_analyzer = RelevanceAnalyzer()
        self.role_mappings = {
            "frontend": "frontend_engineer",
            "react": "frontend_engineer",
            "ui": "frontend_engineer",
            "ux": "frontend_engineer",
            "ml": "data_scientist",
            "machine learning": "data_scientist",
            "data science": "data_scientist",
            "ai": "data_scientist",
            "devops": "devops_engineer",
            "cloud": "devops_engineer",
            "infra": "devops_engineer",
            "data engineer": "data_engineer",
            "etl": "data_engineer",
            "sql": "backend_engineer",
            "api": "backend_engineer",
            "backend": "backend_engineer"
        }
    
    def _detect_role(self, text: str) -> str:
        """Detect the most likely role template from JD text"""
        if not text:
            return self.role_type
            
        text_lower = text.lower()
        counts = Counter()
        for keyword, role in self.role_mappings.items():
            if keyword in text_lower:
                counts[role] += 1
        
        if not counts:
            return self.role_type
            
        return counts.most_common(1)[0][0]
    
    def score(
        self, 
        resume_text: str, 
        job_description: str = "",
        role_keywords: List[str] = None
    ) -> ATSScoreBreakdown:
        """
        Calculate comprehensive ATS score.
        
        Args:
            resume_text: Full resume text
            job_description: Job description (optional, for relevance)
            role_keywords: List of keywords for the role (optional)
        
        Returns:
            Complete ATS score breakdown
        """
        
        # Dynamic Role Pivot: If JD is provided, adapt the entire scoring template
        detected_role = self._detect_role(job_description)
        if job_description and detected_role != self.role_type:
            print(f"[ATS] Dynamic Pivot: Detected role '{detected_role}' from JD. Updating weights...")
            self.role_type = detected_role
            self.skill_matcher = SkillMatcher(detected_role)
            # Re-initialize role_keywords for the new template
            role_keywords = list(self.skill_matcher.skill_weights.keys())

        if role_keywords is None:
            role_keywords = list(self.skill_matcher.skill_weights.keys())
        
        # Dynamic context from JD
        jd_keywords = []
        if job_description:
            jd_keywords = self._extract_jd_keywords(job_description)
            # Merge JD keywords into role keywords for Experience analysis
            role_keywords = list(set(role_keywords + jd_keywords))

        # Component scores
        skill_score, skill_details = self.skill_matcher.score_skills(resume_text, jd_keywords)
        experience_score, experience_details = self.experience_analyzer.analyze(
            resume_text, role_keywords
        )
        project_score, project_details = self.project_analyzer.analyze(resume_text)
        structure_score, structure_details = self.structure_analyzer.analyze(resume_text)
        relevance_score, relevance_details = self.relevance_analyzer.analyze(
            resume_text, job_description
        )
        
        # Boost relevance with a base floor (TF-IDF is often harsh)
        # relevance_score = max(relevance_score, 40) # REMOVED FLOOR FOR ACCURACY        
        # Dynamic weighted final score - shift focus to JD if present
        if job_description:
            # When JD exists, we care much more about specific relevance
            total_score = (
                skill_score * 0.35 +      # Skill match
                experience_score * 0.10 +  # Experience
                project_score * 0.10 +     # Projects
                structure_score * 0.10 +   # Structure
                relevance_score * 0.35     # Job relevance (Direct TF-IDF match)
            )
        else:
            # General template-based scoring
            total_score = (
                skill_score * 0.30 +
                experience_score * 0.20 +
                project_score * 0.15 +
                structure_score * 0.20 +
                relevance_score * 0.15
            )
        
        # Scale linearly to 10
        total_score = total_score / 10
        
        # Identify gaps and recommendations
        gaps = self._identify_gaps(
            skill_details, experience_details, project_details
        )
        recommendations = self._generate_recommendations(
            skill_details, experience_details, project_details, 
            structure_details, total_score
        )
        
        # Extract matched and missing critical skills
        matched_skills = list(skill_details.get("matched_skills", {}).keys())
        missing_critical = list(
            skill_details.get("missing_skills", {}).keys()
        )
        
        return ATSScoreBreakdown(
            total_score=round(total_score, 2),
            skill_match_score=round(skill_score, 2),
            experience_score=round(experience_score, 2),
            project_quality_score=round(project_score, 2),
            structure_score=round(structure_score, 2),
            relevance_score=round(relevance_score, 2),
            skill_details=skill_details,
            experience_details=experience_details,
            project_details=project_details,
            structure_details=structure_details,
            relevance_details=relevance_details,
            gaps=gaps,
            recommendations=recommendations,
            matched_skills=matched_skills,
            missing_critical_skills=missing_critical
        )
    
    @staticmethod
    def _identify_gaps(skill_details: Dict, experience_details: Dict, 
                       project_details: Dict) -> List[str]:
        """Identify skill and experience gaps"""
        gaps = []
        
        if skill_details.get("total_matched", 0) < 5:
            gaps.append("Insufficient skill diversity - add more technical skills")
        
        missing = skill_details.get("missing_skills", {})
        if missing:
            top_missing = list(missing.keys())[:3]
            gaps.append(f"Missing critical skills: {', '.join(top_missing)}")
        
        if experience_details.get("error"):
            gaps.append("No or unclear experience section")
        elif experience_details.get("total_years", 0) < 1:
            gaps.append("Insufficient professional experience (less than 1 year)")
        
        if project_details.get("error"):
            gaps.append("No projects section - add personal/portfolio projects")
        elif project_details.get("project_count", 0) < 2:
            gaps.append("Add more projects to demonstrate practical skills")
        
        if not project_details.get("quantified_projects", 0):
            gaps.append("Projects lack quantified metrics/results")
        
        return gaps
    
    @staticmethod
    def _generate_recommendations(skill_details: Dict, experience_details: Dict,
                                 project_details: Dict, structure_details: Dict,
                                 total_score: float) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        # Skill recommendations
        missing = skill_details.get("missing_skills", {})
        if missing:
            top_missing = list(missing.keys())[:2]
            recommendations.append(
                f"🎯 Learn and add: {', '.join(top_missing)} to your resume"
            )
        
        # Experience recommendations
        if experience_details.get("achievement_density", 0) < 0.5:
            recommendations.append(
                "📈 Enhance experience descriptions with metrics and impact keywords "
                "(e.g., 'improved performance by 40%')"
            )
        
        if experience_details.get("job_progression") == "flat":
            recommendations.append(
                "📊 Show career growth - highlight promotions or expanded responsibilities"
            )
        
        # Project recommendations
        if project_details.get("project_count", 0) < 3:
            recommendations.append(
                "💻 Add 2-3 more projects showcasing different technologies/domains"
            )
        
        if not project_details.get("quantified_projects"):
            recommendations.append(
                "📊 Quantify project results (e.g., '50% faster', '10k+ users')"
            )
        
        # Structure recommendations
        if structure_details.get("page_count", 0) > 2:
            recommendations.append(
                "📄 Reduce resume to 1-2 pages for better ATS parsing"
            )
        
        if not structure_details.get("has_skills"):
            recommendations.append(
                "🏷️ Add a dedicated 'Skills' section with categorized skills"
            )
        
        if not structure_details.get("has_projects"):
            recommendations.append(
                "🚀 Add a 'Projects' section to showcase practical work"
            )
        
        # Overall recommendations
        if total_score < 5:
            recommendations.insert(
                0,
                "⚠️ Major revamp needed - focus on skill additions and clearer descriptions"
            )
        elif total_score < 7:
            recommendations.insert(
                0,
                "⬆️ Room for improvement - enhance descriptions with metrics and impact"
            )
        
        return recommendations[:5]  # Top 5 recommendations

    def _extract_jd_keywords(self, jd_text: str) -> List[str]:
        """
        Simple keyword extractor for technological terms in JD.
        In a production environment, this would use a proper NER model.
        """
        jd_lower = jd_text.lower()
        extracted = []
        
        # Check against our comprehensive synonyms list
        for canonical, synonyms in SKILL_SYNONYMS.items():
            if jd_lower.count(canonical) > 0:
                extracted.append(canonical)
                continue
            for syn in synonyms:
                if jd_lower.count(syn) > 0:
                    extracted.append(canonical)
                    break
        
        return list(set(extracted))

if __name__ == "__main__":
    uvicorn.run("advancedats:app", host="0.0.0.0", port=8001, reload=True)
