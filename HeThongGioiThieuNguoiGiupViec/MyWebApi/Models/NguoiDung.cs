using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

[Table("NguoiDung")]
[Index("Email", Name = "UQ__NguoiDun__A9D1053481495933", IsUnique = true)]
public partial class NguoiDung
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaNguoiDung { get; set; } = null!;

    [StringLength(100)]
    public string? HoTen { get; set; }

    [StringLength(100)]
    [Unicode(false)]
    public string? Email { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string? SoDienThoai { get; set; }

    [StringLength(100)]
    [Unicode(false)]
    public string? MatKhau { get; set; }

    [StringLength(200)]
    public string? DiaChi { get; set; }

    public bool TrangThai { get; set; }

    [StringLength(200)]
    [Unicode(false)]
    public string? RefreshToken { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? NgayTao { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? NgayTaoRefreshToken { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? NgayHetHanRefreshToken { get; set; }

    [InverseProperty("MaKhachhangNavigation")]
    public virtual ICollection<DonDat> DonDatMaKhachhangNavigations { get; set; } = new List<DonDat>();

    [InverseProperty("MaNhanVienNavigation")]
    public virtual ICollection<DonDat> DonDatMaNhanVienNavigations { get; set; } = new List<DonDat>();

    [InverseProperty("MaNguoiGiupViecNavigation")]
    public virtual ICollection<HoSoNguoiGiupViec> HoSoNguoiGiupViecs { get; set; } = new List<HoSoNguoiGiupViec>();

    [InverseProperty("MaKhachHangNavigation")]
    public virtual ICollection<KhieuNai> KhieuNaiMaKhachHangNavigations { get; set; } = new List<KhieuNai>();

    [InverseProperty("MaNhanVienNavigation")]
    public virtual ICollection<KhieuNai> KhieuNaiMaNhanVienNavigations { get; set; } = new List<KhieuNai>();

    [InverseProperty("MaNguoiGiupViecNavigation")]
    public virtual ICollection<NgayLamViec> NgayLamViecs { get; set; } = new List<NgayLamViec>();

    [InverseProperty("MaNguoiDungNavigation")]
    public virtual ICollection<NguoiDungVaiTro> NguoiDungVaiTros { get; set; } = new List<NguoiDungVaiTro>();
}
