using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

[Table("DichVuKyNang")]
public partial class DichVuKyNang
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaDichVu { get; set; } = null!;

    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaKyNang { get; set; } = null!;

    [ForeignKey("MaDichVu")]
    [InverseProperty("DichVuKyNangs")]
    public virtual DichVu MaDichVuNavigation { get; set; } = null!;

    [ForeignKey("MaKyNang")]
    [InverseProperty("DichVuKyNangs")]
    public virtual KyNang MaKyNangNavigation { get; set; } = null!;
}
