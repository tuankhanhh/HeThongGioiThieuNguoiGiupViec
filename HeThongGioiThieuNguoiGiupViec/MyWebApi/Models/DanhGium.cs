using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

public partial class DanhGium
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaDanhGia { get; set; } = null!;

    [StringLength(5)]
    [Unicode(false)]
    public string MaDon { get; set; } = null!;

    public int? SoSao { get; set; }

    [StringLength(255)]
    public string? NoiDung { get; set; }

    [ForeignKey("MaDon")]
    [InverseProperty("DanhGia")]
    public virtual DonDat MaDonNavigation { get; set; } = null!;
}
