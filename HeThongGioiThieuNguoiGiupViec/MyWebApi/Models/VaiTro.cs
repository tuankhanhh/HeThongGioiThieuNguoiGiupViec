using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

[Table("VaiTro")]
public partial class VaiTro
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaVaiTro { get; set; } = null!;

    [StringLength(50)]
    public string? TenVaiTro { get; set; } = null!;

    [StringLength(200)]
    public string? MoTa { get; set; }

    [InverseProperty("MaVaiTroNavigation")]
    public virtual ICollection<NguoiDungVaiTro> NguoiDungVaiTros { get; set; } = new List<NguoiDungVaiTro>();
}
