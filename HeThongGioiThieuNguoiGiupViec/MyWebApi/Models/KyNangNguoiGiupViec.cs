using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

[PrimaryKey("MaKyNang", "MaHoSo")]
[Table("KyNangNguoiGiupViec")]
public partial class KyNangNguoiGiupViec
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaKyNang { get; set; } = null!;

    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaHoSo { get; set; } = null!;

    [Column(TypeName = "datetime")]
    public DateTime? NgayThem { get; set; }

    [ForeignKey("MaHoSo")]
    [InverseProperty("KyNangNguoiGiupViecs")]
    public virtual HoSoNguoiGiupViec MaHoSoNavigation { get; set; } = null!;

    [ForeignKey("MaKyNang")]
    [InverseProperty("KyNangNguoiGiupViecs")]
    public virtual KyNang MaKyNangNavigation { get; set; } = null!;
}
