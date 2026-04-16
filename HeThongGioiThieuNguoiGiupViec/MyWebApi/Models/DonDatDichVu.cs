using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

[Table("DonDatDichVu")]
public partial class DonDatDichVu
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaDonDatDichVu { get; set; } = null!;

    [StringLength(5)]
    [Unicode(false)]
    public string MaDon { get; set; } = null!;

    [StringLength(5)]
    [Unicode(false)]
    public string MaDichVu { get; set; } = null!;

    [InverseProperty("MaDonDatDichVuNavigation")]
    public virtual ICollection<DonDatDichVuNgayLamViec> DonDatDichVuNgayLamViecs { get; set; } = new List<DonDatDichVuNgayLamViec>();

    [ForeignKey("MaDichVu")]
    [InverseProperty("DonDatDichVus")]
    public virtual DichVu MaDichVuNavigation { get; set; } = null!;

    [ForeignKey("MaDon")]
    [InverseProperty("DonDatDichVus")]
    public virtual DonDat MaDonNavigation { get; set; } = null!;

    [InverseProperty("MaDonDatDichVuNavigation")]
    public virtual ICollection<NgayLamViec> NgayLamViecs { get; set; } = new List<NgayLamViec>();
}
