using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

[Table("CaLamViec")]
public partial class CaLamViec
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaCaLamViec { get; set; } = null!;

    public TimeOnly GioBatDau { get; set; }

    public TimeOnly GioKetThuc { get; set; }

    [InverseProperty("MaCaLamViecNavigation")]
    public virtual ICollection<LichRanhCaLamViec> LichRanhCaLamViecs { get; set; } = new List<LichRanhCaLamViec>();
}
