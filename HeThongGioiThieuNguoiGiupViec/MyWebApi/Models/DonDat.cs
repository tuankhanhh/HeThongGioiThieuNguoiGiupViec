using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

[Table("DonDat")]
public partial class DonDat
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaDon { get; set; } = null!;

    [StringLength(5)]
    [Unicode(false)]
    public string MaKhachhang { get; set; } = null!;

    [StringLength(5)]
    [Unicode(false)]
    public string? MaNhanVien { get; set; }

    [StringLength(200)]
    public string? DiaChi { get; set; }
    [StringLength(100)]
    public string? GhiChu { get; set; }
    public int? SoNgay { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal? TongTien { get; set; }

    public DateTime? NgayDat { get; set; }

    [InverseProperty("MaDonNavigation")]
    public virtual ICollection<DanhGium> DanhGia { get; set; } = new List<DanhGium>();

    [InverseProperty("MaDonNavigation")]
    public virtual ICollection<DonDatDichVu> DonDatDichVus { get; set; } = new List<DonDatDichVu>();

    [InverseProperty("MaDonNavigation")]
    public virtual ICollection<KhieuNai> KhieuNais { get; set; } = new List<KhieuNai>();

    [InverseProperty("MaDonNavigation")]
    public virtual ICollection<LichSuTrangThaiDon> LichSuTrangThaiDons { get; set; } = new List<LichSuTrangThaiDon>();

    [ForeignKey("MaKhachhang")]
    [InverseProperty("DonDatMaKhachhangNavigations")]
    public virtual NguoiDung MaKhachhangNavigation { get; set; } = null!;

    [ForeignKey("MaNhanVien")]
    [InverseProperty("DonDatMaNhanVienNavigations")]
    public virtual NguoiDung MaNhanVienNavigation { get; set; } = null!;

    [InverseProperty("MaDonNavigation")]
    public virtual ICollection<ThanhToan> ThanhToans { get; set; } = new List<ThanhToan>();
}
