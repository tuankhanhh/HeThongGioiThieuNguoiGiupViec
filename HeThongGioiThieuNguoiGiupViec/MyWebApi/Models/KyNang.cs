using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

[Table("KyNang")]
public partial class KyNang
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaKyNang { get; set; } = null!;

    [StringLength(50)]
    public string? TenKyNang { get; set; }

    [StringLength(255)]
    public string? MoTa { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string? IconName { get; set; }

    [InverseProperty("MaKyNangNavigation")]
    public virtual ICollection<KyNangNguoiGiupViec> KyNangNguoiGiupViecs { get; set; } = new List<KyNangNguoiGiupViec>();
}
