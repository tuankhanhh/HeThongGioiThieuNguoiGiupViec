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
    public string? MoTa { get; set; }      // Cột mới
    public string? IconName { get; set; }  // Cột mới

    [InverseProperty("MaKyNangNavigation")]
    public virtual ICollection<KyNangNguoiGiupViec> KyNangNguoiGiupViecs { get; set; } = new List<KyNangNguoiGiupViec>();
}
