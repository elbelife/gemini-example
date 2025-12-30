# Copilot Instructions for gemini-example

This project provides examples of using Google's Gemini AI to implement applications, focusing on text generation, chat interactions, and multimodal processing.

## Project Structure
- `README.md`: Project overview and setup instructions
- `src/` or root-level scripts: Main application code
- `examples/`: Individual demo scripts for different Gemini features
- `.env`: API key storage (not committed)
- `requirements.txt` or `package.json`: Dependencies

## Dependencies & Setup
- **Python**: Use `google-generativeai` and `python-dotenv`
- **Node.js**: Use `@google/generative-ai` and `dotenv`
- Install: `pip install -r requirements.txt` or `npm install`
- Configure API: Set `GOOGLE_API_KEY` in `.env` file

## Key Patterns
- **API Initialization**: Always load key from environment and configure with `genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))`
- **Model Selection**:
  - Text-only: `genai.GenerativeModel('gemini-pro')`
  - Multimodal: `genai.GenerativeModel('gemini-pro-vision')`
- **Content Generation**: `response = model.generate_content(prompt)` or `model.generate_content([text, image])`
- **Chat Sessions**: Use `model.startChat()` with history for conversational flows
- **Error Handling**: Wrap API calls in try-except for quota/rate limit errors

## Developer Workflows
- **Run Examples**: Execute scripts like `python examples/text_generation.py`
- **Test Integration**: Verify API responses with simple prompts
- **Add New Features**: Create new files in `examples/` following existing naming (e.g., `chat_example.py`)
- **Environment**: Ensure `.env` is ignored in `.gitignore`; never commit API keys

## Conventions
- Function names: `generate_text(prompt)`, `analyze_image(img_path)`
- Use async/await in Node.js for non-blocking calls
- Include comments explaining Gemini-specific prompts and responses
- Safety settings: Configure as needed for content filtering

## Integration Points
- External: Google Generative AI API (requires API key)
- Internal: Modular scripts that can be imported or run standalone
- Data Flow: Input (text/image) → Gemini API → Processed output (text/chat response)</content>
<parameter name="filePath">/workspaces/gemini-example/.github/copilot-instructions.md