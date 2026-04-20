using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

[Table("LichSuTrangThaiDon")]
public partial class LichSuTrangThaiDon
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaLichSu { get; set; } = null!;

    [StringLength(5)]
    [Unicode(false)]
    public string MaDon { get; set; } = null!;
    public DateTime ThoiGianCapNhat { get; set; }

    [StringLength(100)]
    public string? TrangThai { get; set; }

    [ForeignKey("MaDon")]
    [InverseProperty("LichSuTrangThaiDons")]
    public virtual DonDat MaDonNavigation { get; set; } = null!;
}
