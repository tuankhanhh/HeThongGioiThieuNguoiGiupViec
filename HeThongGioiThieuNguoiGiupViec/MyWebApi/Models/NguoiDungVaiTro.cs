using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

[PrimaryKey("MaNguoiDung", "MaVaiTro")]
[Table("NguoiDungVaiTro")]
public partial class NguoiDungVaiTro
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaNguoiDung { get; set; } = null!;

    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaVaiTro { get; set; } = null!;

    [Column(TypeName = "datetime")]
    public DateTime? NgayGan { get; set; }

    [ForeignKey("MaNguoiDung")]
    [InverseProperty("NguoiDungVaiTros")]
    public virtual NguoiDung MaNguoiDungNavigation { get; set; } = null!;

    [ForeignKey("MaVaiTro")]
    [InverseProperty("NguoiDungVaiTros")]
    public virtual VaiTro MaVaiTroNavigation { get; set; } = null!;
}
