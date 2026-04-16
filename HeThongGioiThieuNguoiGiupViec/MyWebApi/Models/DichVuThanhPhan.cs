using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

[PrimaryKey("MaDichVu", "MaThanhPhan")]
[Table("DichVuThanhPhan")]
public partial class DichVuThanhPhan
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaDichVu { get; set; } = null!;

    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaThanhPhan { get; set; } = null!;

    [StringLength(100)]
    public string? GhiChu { get; set; }

    [ForeignKey("MaDichVu")]
    [InverseProperty("DichVuThanhPhans")]
    public virtual DichVu MaDichVuNavigation { get; set; } = null!;

    [ForeignKey("MaThanhPhan")]
    [InverseProperty("DichVuThanhPhans")]
    public virtual ThanhPhan MaThanhPhanNavigation { get; set; } = null!;
}
