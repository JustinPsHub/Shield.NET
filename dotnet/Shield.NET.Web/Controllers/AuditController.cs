using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Shield.NET.Core.Models;
using Shield.NET.Core.Services;

namespace Shield.NET.Web.Controllers
{
    [ApiController]
    [Route("api/audit")]
    public class AuditController : ControllerBase
    {
        private readonly IComplianceLogger _logger;

        public AuditController(IComplianceLogger logger)
        {
            _logger = logger;
        }

        // GET: api/audit/logs
        // This endpoint feeds the "Live Audit Log" component in the React Dashboard
        [HttpGet("logs")]
        public async Task<ActionResult<IEnumerable<AuditRecord>>> GetLogs()
        {
            var logs = await _logger.GetRecentLogsAsync(50);
            return Ok(logs);
        }

        // POST: api/audit/export
        // Compliance export for EU AI Act audits
        [HttpPost("export")]
        public IActionResult ExportLogs()
        {
            // In a real app, this would stream the file download
            return Ok(new { message = "Export job initiated", format = "JSONL" });
        }
    }
}