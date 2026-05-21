using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

[Table("NgayLamViec")]
public partial class NgayLamViec
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaNgayLamViec { get; set; } = null!;

    [StringLength(5)]
    [Unicode(false)]
    public string MaDonDatDichVu { get; set; } = null!;

    [StringLength(5)]
    [Unicode(false)]
    public string? MaNguoiGiupViec { get; set; }

    public DateOnly? NgayLam { get; set; }

    public TimeOnly? GioBatDau { get; set; }

    public TimeOnly? GioKetThuc { get; set; }

    public int? ThoiLuongThucHien { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? ThoiGianPhanCong { get; set; }

    [StringLength(30)]
    public string? TrangThai { get; set; }

    [InverseProperty("MaNgayLamViecNavigation")]
    public virtual ICollection<KhieuNai> KhieuNais { get; set; } = new List<KhieuNai>();

    [ForeignKey("MaDonDatDichVu")]
    [InverseProperty("NgayLamViecs")]
    public virtual DonDatDichVu MaDonDatDichVuNavigation { get; set; } = null!;

    [ForeignKey("MaNguoiGiupViec")]
    [InverseProperty("NgayLamViecs")]
    public virtual NguoiDung? MaNguoiGiupViecNavigation { get; set; }

    [InverseProperty("MaNgayLamViecNavigation")]
    public virtual ICollection<ThuNhapNguoiGiupViec> ThuNhapNguoiGiupViecs { get; set; } = new List<ThuNhapNguoiGiupViec>();
}
