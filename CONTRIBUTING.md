# Contributing to RecruitAI

Thank you for your interest in contributing to RecruitAI! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Avoid derogatory or discriminatory language
- Focus on constructive feedback
- Report violations to maintainers

## Getting Started

### Fork and Clone

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/your-username/resume-screening-system.git
cd resume-screening-system

# Add upstream remote
git remote add upstream https://github.com/original-owner/resume-screening-system.git
```

### Set Up Development Environment

Follow the [SETUP.md](SETUP.md) guide for installation.

## Development Workflow

### Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### Make Changes

- Write clean, readable code
- Follow project conventions
- Add comments for complex logic
- Update documentation

### Commit Changes

```bash
git add .
git commit -m "feat: Add new feature"
```

### Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a PR on GitHub with:
- Clear title
- Detailed description
- Link to related issues
- Screenshots if UI changes

## Code Style

### Python (Backend)

```python
# Follow PEP 8
# Use type hints
def calculate_match_score(
    candidate_skills: List[str],
    required_skills: List[str]
) -> float:
    """Calculate match score between candidate and job skills."""
    ...

# Docstrings for functions
def upload_resume(file: UploadFile) -> Dict:
    """
    Upload and parse a resume file.
    
    Args:
        file: Uploaded resume file (PDF or DOCX)
        
    Returns:
        Parsed candidate data
    """
    ...
```

### JavaScript/TypeScript (Frontend)

```typescript
// Use TypeScript for type safety
interface Candidate {
  id: number;
  name: string;
  email: string;
  skills: string[];
}

// Use functional components
export default function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <div className="card">
      <h3>{candidate.name}</h3>
    </div>
  );
}
```

## Testing

### Backend Tests

```bash
cd backend

# Run pytest
pytest

# Run specific test
pytest tests/test_auth.py

# Run with coverage
pytest --cov=. --cov-report=html
```

### Frontend Tests

```bash
cd frontend

# Run Jest tests
npm test

# Run with coverage
npm test -- --coverage
```

## Commit Messages

Follow conventional commits:

```
feat: Add new feature
fix: Fix a bug
docs: Update documentation
style: Code style changes
refactor: Code refactoring
test: Add/update tests
chore: Maintenance tasks
```

Example:
```
feat: Add skill extraction from resumes

- Implement NLP-based skill extraction
- Add skill recognition for 100+ skills
- Update resume parser module
```

## Documentation

- Update README.md for major changes
- Add docstrings to functions
- Update API documentation
- Include examples for new features

## Pull Request Process

1. **Update from upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Ensure tests pass**
   ```bash
   # Backend
   cd backend && pytest
   
   # Frontend
   cd frontend && npm test
   ```

3. **Follow code style**
   ```bash
   # Python
   black .
   flake8 .
   
   # TypeScript
   npm run lint
   ```

4. **Create descriptive PR** with:
   - Clear title
   - Description of changes
   - Motivation and context
   - Screenshots (if UI changes)
   - Related issue links

5. **Address review comments** promptly

## Issues and Features

### Reporting Issues

When reporting bugs:
- Use clear title
- Describe steps to reproduce
- Include error messages/logs
- Specify your environment

### Requesting Features

When requesting features:
- Explain the use case
- Describe expected behavior
- Provide examples
- Link to related discussions

## Setting Up IDE

### VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.vscode-pylance",
    "charliermarsh.ruff",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### PyCharm

- Enable code inspections
- Configure Black formatter
- Enable flake8 linter

## Performance Guidelines

### Backend
- Use database indexes
- Implement caching where appropriate
- Optimize queries
- Monitor response times

### Frontend
- Minimize bundle size
- Use code splitting
- Implement lazy loading
- Optimize images

## Security Guidelines

- Never commit secrets
- Use environment variables
- Validate all inputs
- Sanitize outputs
- Keep dependencies updated
- Report vulnerabilities responsibly

## Documentation Standards

### Code Comments

```python
# Good
def calculate_match_score(candidate_skills: List[str], required_skills: List[str]) -> float:
    """Calculate match score using skill intersection."""
    matched = set(candidate_skills) & set(required_skills)
    return (len(matched) / len(required_skills)) * 100 if required_skills else 0

# Avoid
def calculate_match_score(a, b):
    # calculate match
    return ...
```

### Docstrings

```python
def upload_resume(file: UploadFile) -> Dict:
    """
    Upload and parse a resume file.
    
    This function handles file upload, validation, and NLP-based
    parsing to extract candidate information.
    
    Args:
        file: Uploaded resume file (PDF or DOCX), max 5MB
        
    Returns:
        Dictionary containing:
        - id: Candidate ID
        - name: Extracted name
        - skills: List of extracted skills
        - email: Extracted email
        - experience_years: Years of experience
        
    Raises:
        HTTPException: If file type is invalid or parsing fails
        
    Example:
        >>> result = await upload_resume(file)
        >>> print(result['name'])
        'John Doe'
    """
    ...
```

## Branching Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `docs/*` - Documentation changes

## Release Process

1. Update version in `package.json` and `main.py`
2. Update CHANGELOG
3. Create release branch
4. Create GitHub release with notes
5. Deploy to production

## Getting Help

- **Issues**: Open an issue for bugs/features
- **Discussions**: Use discussions for questions
- **Email**: contact@recruitai.com
- **Documentation**: Check README and wiki

## Recognition

Contributors are recognized in:
- CONTRIBUTORS.md
- GitHub contributors page
- Release notes

## License

By contributing, you agree your contributions are licensed under the MIT License.

---

**Thank you for contributing to RecruitAI!** 🚀
