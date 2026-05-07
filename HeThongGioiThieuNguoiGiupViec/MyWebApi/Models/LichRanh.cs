using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

[Table("LichRanh")]
public partial class LichRanh
{
    [Key]
    [StringLength(5)]
    [Unicode(false)]
    public string MaLichRanh { get; set; } = null!;

    [StringLength(5)]
    [Unicode(false)]
    public string MaNguoiGiupViec { get; set; } = null!;

    public DateOnly Ngay { get; set; }

    [InverseProperty("MaLichRanhNavigation")]
    public virtual ICollection<LichRanhCaLamViec> LichRanhCaLamViecs { get; set; } = new List<LichRanhCaLamViec>();

    [ForeignKey("MaNguoiGiupViec")]
    [InverseProperty("LichRanhs")]
    public virtual NguoiDung MaNguoiGiupViecNavigation { get; set; } = null!;
}
