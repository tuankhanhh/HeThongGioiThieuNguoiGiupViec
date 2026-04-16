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
    public string? TenDichVu { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal? GiaTheoGio { get; set; }

    public bool? PhoBien { get; set; }

    [StringLength(30)]
    public string? TrangThai { get; set; }

    [InverseProperty("MaDichVuNavigation")]
    public virtual ICollection<DichVuThanhPhan> DichVuThanhPhans { get; set; } = new List<DichVuThanhPhan>();

    [InverseProperty("MaDichVuNavigation")]
    public virtual ICollection<DonDatDichVu> DonDatDichVus { get; set; } = new List<DonDatDichVu>();
}
