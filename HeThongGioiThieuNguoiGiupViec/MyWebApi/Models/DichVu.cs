using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

[Table("DichVu")]
public partial class DichVu
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaDichVu { get; set; } = null!;

    [StringLength(100)]
    public string TenDichVu { get; set; } = null!;

    [StringLength(500)]
    public string? MoTa { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? GiaTheoGio { get; set; }

    [StringLength(255)]
    [Unicode(false)]
    public string? HinhAnh { get; set; }

    public bool? PhoBien { get; set; }

    [StringLength(30)]
    public string? TrangThai { get; set; }

    [StringLength(5)]
    [Unicode(false)]
    public string? MaKyNang { get; set; }

    [InverseProperty("MaDichVuNavigation")]
    public virtual ICollection<DichVuThanhPhan> DichVuThanhPhans { get; set; } = new List<DichVuThanhPhan>();

    [InverseProperty("MaDichVuNavigation")]
    public virtual ICollection<DonDatDichVu> DonDatDichVus { get; set; } = new List<DonDatDichVu>();

    [InverseProperty("MaDichVuNavigation")]
    public virtual ICollection<DichVuKyNang> DichVuKyNangs { get; set; } = new List<DichVuKyNang>();
}
