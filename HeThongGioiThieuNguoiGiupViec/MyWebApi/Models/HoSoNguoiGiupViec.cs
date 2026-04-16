using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

[Table("HoSoNguoiGiupViec")]
public partial class HoSoNguoiGiupViec
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaHoSo { get; set; } = null!;

    [StringLength(5)]
    [Unicode(false)]
    public string MaNguoiGiupViec { get; set; } = null!;

    [StringLength(12)]
    [Unicode(false)]
    public string? SoCCCD { get; set; }

    public DateOnly? NgayCap { get; set; }

    [StringLength(100)]
    public string? NoiCap { get; set; }

    [StringLength(200)]
    public string? KinhNghiem { get; set; }

    [StringLength(50)]
    public string? TrangThaiXacMinh { get; set; }

    [InverseProperty("MaHoSoNavigation")]
    public virtual ICollection<KyNangNguoiGiupViec> KyNangNguoiGiupViecs { get; set; } = new List<KyNangNguoiGiupViec>();

    [ForeignKey("MaNguoiGiupViec")]
    [InverseProperty("HoSoNguoiGiupViecs")]
    public virtual NguoiDung MaNguoiGiupViecNavigation { get; set; } = null!;
}
