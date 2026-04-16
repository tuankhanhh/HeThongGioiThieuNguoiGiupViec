using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

[Table("ThanhToan")]
public partial class ThanhToan
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaThanhToan { get; set; } = null!;

    [StringLength(5)]
    [Unicode(false)]
    public string MaDon { get; set; } = null!;

    [StringLength(50)]
    public string? TrangThaiThanhToan { get; set; }

    [ForeignKey("MaDon")]
    [InverseProperty("ThanhToans")]
    public virtual DonDat MaDonNavigation { get; set; } = null!;
}
