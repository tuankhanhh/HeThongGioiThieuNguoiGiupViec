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

    [Column("SoCCCD")]
    [StringLength(12)]
    [Unicode(false)]
    public string? SoCccd { get; set; }

    public DateOnly? NgaySinh { get; set; }

    [StringLength(100)]
    public string? GioiTinh { get; set; }

    [StringLength(200)]
    public string? KinhNghiem { get; set; }

    [StringLength(200)]
    public string? MoTaChiTietKinhNghiem { get; set; }

    [StringLength(100)]
    public string? TenNguoiThan { get; set; }

    [Column("SDTNguoiThan")]
    [StringLength(10)]
    [Unicode(false)]
    public string? SdtnguoiThan { get; set; }

    [Column("AnhCCCDMatTruoc")]
    [StringLength(255)]
    [Unicode(false)]
    public string? AnhCccdmatTruoc { get; set; }

    [Column("AnhCCCDMatSau")]
    [StringLength(255)]
    [Unicode(false)]
    public string? AnhCccdmatSau { get; set; }

    [StringLength(255)]
    [Unicode(false)]
    public string? AnhChanDung { get; set; }

    [StringLength(255)]
    [Unicode(false)]
    public string? GiayXacNhanCuTru { get; set; }

    [StringLength(50)]
    public string? TrangThaiXacMinh { get; set; }

    [StringLength(200)]
    public string? LyDoTuChoi { get; set; }


    [InverseProperty("MaHoSoNavigation")]
    public virtual ICollection<KyNangNguoiGiupViec> KyNangNguoiGiupViecs { get; set; } = new List<KyNangNguoiGiupViec>();

    [ForeignKey("MaNguoiGiupViec")]
    [InverseProperty("HoSoNguoiGiupViecs")]
    public virtual NguoiDung MaNguoiGiupViecNavigation { get; set; } = null!;
}
