using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

[Table("KhieuNai")]
public partial class KhieuNai
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaKhieuNai { get; set; } = null!;

    [StringLength(5)]
    [Unicode(false)]
    public string MaDon { get; set; } = null!;

    [StringLength(5)]
    [Unicode(false)]
    public string MaKhachHang { get; set; } = null!;

    [StringLength(5)]
    [Unicode(false)]
    public string MaNhanVien { get; set; } = null!;

    [ForeignKey("MaDon")]
    [InverseProperty("KhieuNais")]
    public virtual DonDat MaDonNavigation { get; set; } = null!;

    [ForeignKey("MaKhachHang")]
    [InverseProperty("KhieuNaiMaKhachHangNavigations")]
    public virtual NguoiDung MaKhachHangNavigation { get; set; } = null!;

    [ForeignKey("MaNhanVien")]
    [InverseProperty("KhieuNaiMaNhanVienNavigations")]
    public virtual NguoiDung MaNhanVienNavigation { get; set; } = null!;

    public string NoiDung { get; set; } = null!;
    
    public DateTime ThoiGian { get; set; }
    public string TrangThai { get; set; } = "Chờ xử lý";
    public string? PhanHoi { get; set; }
}
