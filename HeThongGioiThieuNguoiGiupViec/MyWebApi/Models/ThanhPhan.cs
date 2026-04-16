using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

[Table("ThanhPhan")]
public partial class ThanhPhan
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaThanhPhan { get; set; } = null!;

    [StringLength(200)]
    public string? TenThanhPhan { get; set; }

    [InverseProperty("MaThanhPhanNavigation")]
    public virtual ICollection<DichVuThanhPhan> DichVuThanhPhans { get; set; } = new List<DichVuThanhPhan>();
}
