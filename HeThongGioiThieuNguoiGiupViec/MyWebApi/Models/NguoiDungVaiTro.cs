using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Models;

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

    public DateTime? NgayGan { get; set; }

    // 🔥 CHỈ GIỮ 2 NAVIGATION NÀY
    [ForeignKey(nameof(MaNguoiDung))]
    public virtual NguoiDung MaNguoiDungNavigation { get; set; } = null!;

    [ForeignKey(nameof(MaVaiTro))]
    public virtual VaiTro MaVaiTroNavigation { get; set; } = null!;
}