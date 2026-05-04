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

    public virtual DbSet<CaLamViec> CaLamViecs { get; set; }

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

    public virtual DbSet<LichRanhCaLamViec> LichRanhCaLamViecs { get; set; }

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
        => optionsBuilder.UseSqlServer("Server=localhost;Database=dbHeThongGioiThieuNguoiGiupViec;User Id=sa;Password=12345;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CaLamViec>(entity =>
        {
            entity.HasKey(e => e.MaCaLamViec).HasName("PK__CaLamVie__E545F625FAB6F117");

            entity.Property(e => e.MaCaLamViec).IsFixedLength();
        });

        modelBuilder.Entity<DanhGium>(entity =>
        {
            entity.HasKey(e => e.MaDanhGia).HasName("PK__DanhGia__AA9515BF9C65F490");

            entity.HasOne(d => d.MaDonNavigation).WithMany(p => p.DanhGia)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DanhGia__MaDon__75A278F5");
        });

        modelBuilder.Entity<DichVu>(entity =>
        {
            entity.HasKey(e => e.MaDichVu).HasName("PK__DichVu__C0E6DE8F4311F90C");

            entity.Property(e => e.PhoBien).HasDefaultValue(false);
            entity.Property(e => e.TrangThai).HasDefaultValue("Đang hoạt động");
        });

        modelBuilder.Entity<DichVuThanhPhan>(entity =>
        {
            entity.HasKey(e => new { e.MaDichVu, e.MaThanhPhan }).HasName("PK__DichVuTh__3B626B8B711B2213");

            entity.HasOne(d => d.MaDichVuNavigation).WithMany(p => p.DichVuThanhPhans)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DichVuTha__MaDic__59FA5E80");

            entity.HasOne(d => d.MaThanhPhanNavigation).WithMany(p => p.DichVuThanhPhans)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DichVuTha__MaTha__5AEE82B9");
        });

        modelBuilder.Entity<DonDat>(entity =>
        {
            entity.HasKey(e => e.MaDon).HasName("PK__DonDat__3D89F5680783AC34");

            entity.HasOne(d => d.MaKhachhangNavigation).WithMany(p => p.DonDatMaKhachhangNavigations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonDat__MaKhachh__5DCAEF64");

            entity.HasOne(d => d.MaNhanVienNavigation).WithMany(p => p.DonDatMaNhanVienNavigations).HasConstraintName("FK__DonDat__MaNhanVi__5EBF139D");
        });

        modelBuilder.Entity<DonDatDichVu>(entity =>
        {
            entity.HasKey(e => e.MaDonDatDichVu).HasName("PK__DonDatDi__71609B63C073E6CB");

            entity.HasOne(d => d.MaDichVuNavigation).WithMany(p => p.DonDatDichVus)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonDatDic__MaDic__628FA481");

            entity.HasOne(d => d.MaDonNavigation).WithMany(p => p.DonDatDichVus)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonDatDic__MaDon__619B8048");
        });

        modelBuilder.Entity<DonDatDichVuNgayLamViec>(entity =>
        {
            entity.HasKey(e => new { e.MaDonDatDichVu, e.MaNgayLamViec }).HasName("PK__DonDatDi__0957E6437880AAFD");

            entity.HasOne(d => d.MaDonDatDichVuNavigation).WithMany(p => p.DonDatDichVuNgayLamViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonDatDic__MaDon__693CA210");

            entity.HasOne(d => d.MaNgayLamViecNavigation).WithMany(p => p.DonDatDichVuNgayLamViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonDatDic__MaNga__6A30C649");
        });

        modelBuilder.Entity<HoSoNguoiGiupViec>(entity =>
        {
            entity.HasKey(e => e.MaHoSo).HasName("PK__HoSoNguo__1666423C8BFFE263");

            entity.HasOne(d => d.MaNguoiGiupViecNavigation).WithMany(p => p.HoSoNguoiGiupViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__HoSoNguoi__MaNgu__440B1D61");
        });

        modelBuilder.Entity<KhieuNai>(entity =>
        {
            entity.HasKey(e => e.MaKhieuNai).HasName("PK__KhieuNai__1D72BE5258C1B72C");

            entity.Property(e => e.ThoiGian).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.TrangThai).HasDefaultValue("Chưa xử lý");

            entity.HasOne(d => d.MaDonNavigation).WithMany(p => p.KhieuNais)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KhieuNai__MaDon__7B5B524B");

            entity.HasOne(d => d.MaKhachHangNavigation).WithMany(p => p.KhieuNaiMaKhachHangNavigations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KhieuNai__MaKhac__7C4F7684");

            entity.HasOne(d => d.MaNhanVienNavigation).WithMany(p => p.KhieuNaiMaNhanVienNavigations).HasConstraintName("FK__KhieuNai__MaNhan__7D439ABD");
        });

        modelBuilder.Entity<KyNang>(entity =>
        {
            entity.HasKey(e => e.MaKyNang).HasName("PK__KyNang__796CFDAF2E9E2047");
        });

        modelBuilder.Entity<KyNangNguoiGiupViec>(entity =>
        {
            entity.HasKey(e => new { e.MaKyNang, e.MaHoSo }).HasName("PK__KyNangNg__A80A998C77096545");

            entity.HasOne(d => d.MaHoSoNavigation).WithMany(p => p.KyNangNguoiGiupViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KyNangNgu__MaHoS__5165187F");

            entity.HasOne(d => d.MaKyNangNavigation).WithMany(p => p.KyNangNguoiGiupViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KyNangNgu__MaKyN__5070F446");
        });

        modelBuilder.Entity<LichRanh>(entity =>
        {
            entity.HasKey(e => e.MaLichRanh).HasName("PK__LichRanh__0942D6460245CDD9");

            entity.Property(e => e.MaLichRanh).IsFixedLength();
            entity.Property(e => e.MaNguoiGiupViec).IsFixedLength();
        });

        modelBuilder.Entity<LichRanhCaLamViec>(entity =>
        {
            entity.HasKey(e => new { e.MaLichRanh, e.MaCaLamViec }).HasName("PK__LichRanh__47168924F252207F");

            entity.Property(e => e.MaLichRanh).IsFixedLength();
            entity.Property(e => e.MaCaLamViec).IsFixedLength();

            entity.HasOne(d => d.MaCaLamViecNavigation).WithMany(p => p.LichRanhCaLamViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__LichRanhC__MaCaL__4BAC3F29");

            entity.HasOne(d => d.MaLichRanhNavigation).WithMany(p => p.LichRanhCaLamViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__LichRanhC__MaLic__4AB81AF0");
        });

        modelBuilder.Entity<LichSuTrangThaiDon>(entity =>
        {
            entity.HasKey(e => e.MaLichSu).HasName("PK__LichSuTr__C443222A303C2A51");

            entity.HasOne(d => d.MaDonNavigation).WithMany(p => p.LichSuTrangThaiDons)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__LichSuTra__MaDon__72C60C4A");
        });

        modelBuilder.Entity<NgayLamViec>(entity =>
        {
            entity.HasKey(e => e.MaNgayLamViec).HasName("PK__NgayLamV__8377D20669061D3C");

            entity.HasOne(d => d.MaDonDatDichVuNavigation).WithMany(p => p.NgayLamViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__NgayLamVi__MaDon__656C112C");

            entity.HasOne(d => d.MaNguoiGiupViecNavigation).WithMany(p => p.NgayLamViecs).HasConstraintName("FK__NgayLamVi__MaNgu__66603565");
        });

        modelBuilder.Entity<NguoiDung>(entity =>
        {
            entity.HasKey(e => e.MaNguoiDung).HasName("PK__NguoiDun__C539D76288D8465A");

            entity.Property(e => e.NgayTao).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.NgayTaoRefreshToken).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.TrangThai).HasDefaultValue(true);
        });

        modelBuilder.Entity<NguoiDungVaiTro>(entity =>
        {
            entity.HasKey(e => new { e.MaNguoiDung, e.MaVaiTro }).HasName("PK__NguoiDun__291D137E0F200253");

            entity.Property(e => e.NgayGan).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.MaNguoiDungNavigation).WithMany(p => p.NguoiDungVaiTros)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__NguoiDung__MaNgu__403A8C7D");

            entity.HasOne(d => d.MaVaiTroNavigation).WithMany(p => p.NguoiDungVaiTros)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__NguoiDung__MaVai__412EB0B6");
        });

        modelBuilder.Entity<ThanhPhan>(entity =>
        {
            entity.HasKey(e => e.MaThanhPhan).HasName("PK__ThanhPha__B84B504E8B93E9D5");
        });

        modelBuilder.Entity<ThanhToan>(entity =>
        {
            entity.HasKey(e => e.MaThanhToan).HasName("PK__ThanhToa__D4B2584497C0B380");

            entity.HasOne(d => d.MaDonNavigation).WithMany(p => p.ThanhToans)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ThanhToan__MaDon__6FE99F9F");
        });

        modelBuilder.Entity<ThuNhapNguoiGiupViec>(entity =>
        {
            entity.HasKey(e => e.MaThuNhap).HasName("PK__ThuNhapN__959076B270FD8A80");

            entity.HasOne(d => d.MaNgayLamViecNavigation).WithMany(p => p.ThuNhapNguoiGiupViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ThuNhapNg__MaNga__6D0D32F4");
        });

        modelBuilder.Entity<VaiTro>(entity =>
        {
            entity.HasKey(e => e.MaVaiTro).HasName("PK__VaiTro__C24C41CFD13533A2");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
