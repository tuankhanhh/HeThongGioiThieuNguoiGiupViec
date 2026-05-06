using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

[PrimaryKey("MaLichRanh", "MaCaLamViec")]
[Table("LichRanhCaLamViec")]
public partial class LichRanhCaLamViec
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaLichRanh { get; set; } = null!;

    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaCaLamViec { get; set; } = null!;
    public DateTime ThoiGianTao { get; set; }

    [StringLength(100)]
    public string? GhiChu { get; set; }

    [ForeignKey("MaCaLamViec")]
    [InverseProperty("LichRanhCaLamViecs")]
    public virtual CaLamViec MaCaLamViecNavigation { get; set; } = null!;

    [ForeignKey("MaLichRanh")]
    [InverseProperty("LichRanhCaLamViecs")]
    public virtual LichRanh MaLichRanhNavigation { get; set; } = null!;
}
