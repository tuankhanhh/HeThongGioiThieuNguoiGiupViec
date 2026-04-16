using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

[PrimaryKey("MaDonDatDichVu", "MaNgayLamViec")]
[Table("DonDatDichVuNgayLamViec")]
public partial class DonDatDichVuNgayLamViec
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaDonDatDichVu { get; set; } = null!;

    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaNgayLamViec { get; set; } = null!;

    public int? ThoiGianThucHien { get; set; }

    [ForeignKey("MaDonDatDichVu")]
    [InverseProperty("DonDatDichVuNgayLamViecs")]
    public virtual DonDatDichVu MaDonDatDichVuNavigation { get; set; } = null!;

    [ForeignKey("MaNgayLamViec")]
    [InverseProperty("DonDatDichVuNgayLamViecs")]
    public virtual NgayLamViec MaNgayLamViecNavigation { get; set; } = null!;
}
