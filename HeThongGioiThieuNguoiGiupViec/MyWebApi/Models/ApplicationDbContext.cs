using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace MyWebApi.Models;

public partial class ApplicationDbContext : DbContext
{
    public ApplicationDbContext()
    {
    }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<DanhGium> DanhGia { get; set; }

    public virtual DbSet<DichVu> DichVus { get; set; }

    public virtual DbSet<DichVuThanhPhan> DichVuThanhPhans { get; set; }

    public virtual DbSet<DonDat> DonDats { get; set; }

    public virtual DbSet<DonDatDichVu> DonDatDichVus { get; set; }

    public virtual DbSet<DonDatDichVuNgayLamViec> DonDatDichVuNgayLamViecs { get; set; }

    public virtual DbSet<HoSoNguoiGiupViec> HoSoNguoiGiupViecs { get; set; }

    public virtual DbSet<KhieuNai> KhieuNais { get; set; }

    public virtual DbSet<KyNang> KyNangs { get; set; }

    public virtual DbSet<KyNangNguoiGiupViec> KyNangNguoiGiupViecs { get; set; }

    public virtual DbSet<LichRanh> LichRanhs { get; set; }

    public virtual DbSet<LichSuTrangThaiDon> LichSuTrangThaiDons { get; set; }

    public virtual DbSet<NgayLamViec> NgayLamViecs { get; set; }

    public virtual DbSet<NguoiDung> NguoiDungs { get; set; }

    public virtual DbSet<NguoiDungVaiTro> NguoiDungVaiTros { get; set; }

    public virtual DbSet<ThanhPhan> ThanhPhans { get; set; }

    public virtual DbSet<ThanhToan> ThanhToans { get; set; }

    public virtual DbSet<ThuNhapNguoiGiupViec> ThuNhapNguoiGiupViecs { get; set; }

    public virtual DbSet<VaiTro> VaiTros { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=DESKTOP-3J83AIB;Database=dbHeThongGioiThieuNguoiGiupViec;User Id=sa;Password=123456;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<DanhGium>(entity =>
        {
            entity.HasKey(e => e.MaDanhGia).HasName("PK__DanhGia__AA9515BF9DAAB205");

            entity.HasOne(d => d.MaDonNavigation).WithMany(p => p.DanhGia)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DanhGia__MaDon__6E01572D");
        });

        modelBuilder.Entity<DichVu>(entity =>
        {
            entity.HasKey(e => e.MaDichVu).HasName("PK__DichVu__C0E6DE8FD4DE3D61");
        });

        modelBuilder.Entity<DichVuThanhPhan>(entity =>
        {
            entity.HasKey(e => new { e.MaDichVu, e.MaThanhPhan }).HasName("PK__DichVuTh__3B626B8BD8F64561");

            entity.HasOne(d => d.MaDichVuNavigation).WithMany(p => p.DichVuThanhPhans)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DichVuTha__MaDic__52593CB8");

            entity.HasOne(d => d.MaThanhPhanNavigation).WithMany(p => p.DichVuThanhPhans)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DichVuTha__MaTha__534D60F1");
        });

        modelBuilder.Entity<DonDat>(entity =>
        {
            entity.HasKey(e => e.MaDon).HasName("PK__DonDat__3D89F568363A738C");

            entity.HasOne(d => d.MaKhachhangNavigation).WithMany(p => p.DonDatMaKhachhangNavigations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonDat__MaKhachh__5629CD9C");

            entity.HasOne(d => d.MaNhanVienNavigation).WithMany(p => p.DonDatMaNhanVienNavigations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonDat__MaNhanVi__571DF1D5");
        });

        modelBuilder.Entity<DonDatDichVu>(entity =>
        {
            entity.HasKey(e => e.MaDonDatDichVu).HasName("PK__DonDatDi__71609B6379FD592C");

            entity.HasOne(d => d.MaDichVuNavigation).WithMany(p => p.DonDatDichVus)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonDatDic__MaDic__5AEE82B9");

            entity.HasOne(d => d.MaDonNavigation).WithMany(p => p.DonDatDichVus)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonDatDic__MaDon__59FA5E80");
        });

        modelBuilder.Entity<DonDatDichVuNgayLamViec>(entity =>
        {
            entity.HasKey(e => new { e.MaDonDatDichVu, e.MaNgayLamViec }).HasName("PK__DonDatDi__0957E6434CE3BDF2");

            entity.HasOne(d => d.MaDonDatDichVuNavigation).WithMany(p => p.DonDatDichVuNgayLamViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonDatDic__MaDon__619B8048");

            entity.HasOne(d => d.MaNgayLamViecNavigation).WithMany(p => p.DonDatDichVuNgayLamViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonDatDic__MaNga__628FA481");
        });

        modelBuilder.Entity<HoSoNguoiGiupViec>(entity =>
        {
            entity.HasKey(e => e.MaHoSo).HasName("PK__HoSoNguo__1666423C8AA48FA0");

            entity.HasOne(d => d.MaNguoiGiupViecNavigation).WithMany(p => p.HoSoNguoiGiupViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__HoSoNguoi__MaNgu__4222D4EF");
        });

        modelBuilder.Entity<KhieuNai>(entity =>
        {
            entity.HasKey(e => e.MaKhieuNai).HasName("PK__KhieuNai__1D72BE52B90CF20F");

            entity.HasOne(d => d.MaDonNavigation).WithMany(p => p.KhieuNais)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KhieuNai__MaDon__70DDC3D8");

            entity.HasOne(d => d.MaKhachHangNavigation).WithMany(p => p.KhieuNaiMaKhachHangNavigations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KhieuNai__MaKhac__71D1E811");

            entity.HasOne(d => d.MaNhanVienNavigation).WithMany(p => p.KhieuNaiMaNhanVienNavigations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KhieuNai__MaNhan__72C60C4A");
        });

        modelBuilder.Entity<KyNang>(entity =>
        {
            entity.HasKey(e => e.MaKyNang).HasName("PK__KyNang__796CFDAFD0544608");
        });

        modelBuilder.Entity<KyNangNguoiGiupViec>(entity =>
        {
            entity.HasKey(e => new { e.MaKyNang, e.MaHoSo }).HasName("PK__KyNangNg__A80A998C7D188E33");

            entity.Property(e => e.NgayThem).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.MaHoSoNavigation).WithMany(p => p.KyNangNguoiGiupViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KyNangNgu__MaHoS__4BAC3F29");

            entity.HasOne(d => d.MaKyNangNavigation).WithMany(p => p.KyNangNguoiGiupViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KyNangNgu__MaKyN__4AB81AF0");
        });

        modelBuilder.Entity<LichRanh>(entity =>
        {
            entity.HasKey(e => e.MaLichRanh).HasName("PK__LichRanh__0942D64652ECC59D");

            entity.HasOne(d => d.MaNguoiGiupViecNavigation).WithMany(p => p.LichRanhs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__LichRanh__MaNguo__44FF419A");
        });

        modelBuilder.Entity<LichSuTrangThaiDon>(entity =>
        {
            entity.HasKey(e => e.MaLichSu).HasName("PK__LichSuTr__C443222ADC19301E");

            entity.HasOne(d => d.MaDonNavigation).WithMany(p => p.LichSuTrangThaiDons)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__LichSuTra__MaDon__6B24EA82");
        });

        modelBuilder.Entity<NgayLamViec>(entity =>
        {
            entity.HasKey(e => e.MaNgayLamViec).HasName("PK__NgayLamV__8377D2067C70EE5F");

            entity.HasOne(d => d.MaDonDatDichVuNavigation).WithMany(p => p.NgayLamViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__NgayLamVi__MaDon__5DCAEF64");

            entity.HasOne(d => d.MaNguoiGiupViecNavigation).WithMany(p => p.NgayLamViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__NgayLamVi__MaNgu__5EBF139D");
        });

        modelBuilder.Entity<NguoiDung>(entity =>
        {
            entity.HasKey(e => e.MaNguoiDung).HasName("PK__NguoiDun__C539D76242B06CD3");

            entity.Property(e => e.NgayTao).HasDefaultValueSql("(getdate())");
        });

        modelBuilder.Entity<NguoiDungVaiTro>(entity =>
        {
            entity.HasKey(e => new { e.MaNguoiDung, e.MaVaiTro });

            entity.Property(e => e.NgayGan)
                .HasDefaultValueSql("(getdate())");

            // 🔥 FIX 1: NguoiDung FK
            entity.HasOne(d => d.MaNguoiDungNavigation)
                .WithMany(p => p.NguoiDungVaiTros)
                .HasForeignKey(d => d.MaNguoiDung)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_NguoiDungVaiTro_NguoiDung");

            // 🔥 FIX 2: VaiTro FK
            entity.HasOne(d => d.MaVaiTroNavigation)
                .WithMany(p => p.NguoiDungVaiTros)
                .HasForeignKey(d => d.MaVaiTro)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_NguoiDungVaiTro_VaiTro");
        });

        modelBuilder.Entity<ThanhPhan>(entity =>
        {
            entity.HasKey(e => e.MaThanhPhan).HasName("PK__ThanhPha__B84B504E0F2E52F5");
        });

        modelBuilder.Entity<ThanhToan>(entity =>
        {
            entity.HasKey(e => e.MaThanhToan).HasName("PK__ThanhToa__D4B25844F6AF6297");

            entity.HasOne(d => d.MaDonNavigation).WithMany(p => p.ThanhToans)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ThanhToan__MaDon__68487DD7");
        });

        modelBuilder.Entity<ThuNhapNguoiGiupViec>(entity =>
        {
            entity.HasKey(e => e.MaThuNhap).HasName("PK__ThuNhapN__959076B278482A7B");

            entity.HasOne(d => d.MaNgayLamViecNavigation).WithMany(p => p.ThuNhapNguoiGiupViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ThuNhapNg__MaNga__656C112C");
        });

        modelBuilder.Entity<VaiTro>(entity =>
        {
            entity.HasKey(e => e.MaVaiTro).HasName("PK__VaiTro__C24C41CFADF6CC59");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
