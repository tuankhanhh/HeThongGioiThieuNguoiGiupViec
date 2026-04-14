using System.ComponentModel.DataAnnotations;

namespace MyWebApi.DTO.Request
{
    public class LoginRequest
    {
        [Required]
        public string UserName { get; set; }

        [Required]
        public string Password { get; set; }

    }
}
