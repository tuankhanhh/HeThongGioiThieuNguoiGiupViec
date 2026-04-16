using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

[Table("ThuNhapNguoiGiupViec")]
public partial class ThuNhapNguoiGiupViec
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaThuNhap { get; set; } = null!;

    [StringLength(5)]
    [Unicode(false)]
    public string MaNgayLamViec { get; set; } = null!;

    [Column(TypeName = "decimal(10, 2)")]
    public decimal? SoTien { get; set; }

    [ForeignKey("MaNgayLamViec")]
    [InverseProperty("ThuNhapNguoiGiupViecs")]
    public virtual NgayLamViec MaNgayLamViecNavigation { get; set; } = null!;
}
