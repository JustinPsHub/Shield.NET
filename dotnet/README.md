# Shield.NET Core & Integration

This directory contains the C# source code for the Shield.NET Core Library and Middleware.

## Architecture

The `ShieldMiddleware` implements `IChatClient` (mimicking `Microsoft.Extensions.AI`). It sits between your application code and the actual LLM (OpenAI, Azure, etc.).

`App -> ShieldMiddleware -> (PiiRedactor -> InjectionCheck) -> InnerChatClient (LLM) -> (HallucinationCheck) -> App`

## Integration with React Dashboard

The React Dashboard included in the root of this repository is designed to visualize the metrics produced by this backend.

In a production environment, the integration works as follows:

1.  **Log Aggregation**:
    The `FileComplianceLogger` (or a Splunk/SQL implementation) writes JSON logs to a centralized storage.
    
2.  **Web API Layer**:
    You would create a standard .NET Web API controller to serve these logs to the dashboard.

    ```csharp
    [ApiController]
    [Route("api/shield")]
    public class ShieldController : ControllerBase
    {
        // GET /api/shield/logs
        [HttpGet("logs")]
        public IActionResult GetLiveLogs()
        {
            // Read from the JSON log file produced by FileComplianceLogger
            var logs = LogReader.GetRecentLogs(100); 
            return Ok(logs);
        }

        // POST /api/shield/analyze
        // Used by the "Playground" in the React App
        [HttpPost("analyze")]
        public async Task<IActionResult> AnalyzePrompt([FromBody] PromptRequest req)
        {
            // Instantiates the ShieldMiddleware on the fly to test a prompt
            // Returns the GuardrailResponse object expected by the frontend
            var result = await _shieldService.AnalyzeAsync(req.Input);
            return Ok(result);
        }
    }
    ```

3.  **Frontend polling**:
    The React `Dashboard.tsx` component would be updated to fetch from these endpoints instead of using the `geminiService` simulation.

## Running Tests

Navigate to the `Shield.NET.Tests` folder and run:

```bash
dotnet test
```
