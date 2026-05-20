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
            entity.HasKey(e => e.MaCaLamViec).HasName("PK__CaLamVie__E545F625B3EE0F1B");

            entity.Property(e => e.MaCaLamViec).IsFixedLength();
        });

        modelBuilder.Entity<DanhGium>(entity =>
        {
            entity.HasKey(e => e.MaDanhGia).HasName("PK__DanhGia__AA9515BF4CC5655D");

            entity.Property(e => e.MaDanhGia).IsFixedLength();
            entity.Property(e => e.MaDon).IsFixedLength();

            entity.HasOne(d => d.MaDonNavigation).WithMany(p => p.DanhGia)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DanhGia__MaDon__74AE54BC");
        });

        modelBuilder.Entity<DichVu>(entity =>
        {
            entity.HasKey(e => e.MaDichVu).HasName("PK__DichVu__C0E6DE8F5B795369");

            entity.Property(e => e.MaDichVu).IsFixedLength();
            entity.Property(e => e.MaKyNang).IsFixedLength();
            entity.Property(e => e.PhoBien).HasDefaultValue(false);
            entity.Property(e => e.TrangThai).HasDefaultValue("Đang hoạt động");

            entity.HasOne(d => d.MaKyNangNavigation).WithMany(p => p.DichVus).HasConstraintName("FK__DichVu__MaKyNang__59FA5E80");
        });

        modelBuilder.Entity<DichVuThanhPhan>(entity =>
        {
            entity.HasKey(e => new { e.MaDichVu, e.MaThanhPhan }).HasName("PK__DichVuTh__3B626B8B9F2688E1");

            entity.Property(e => e.MaDichVu).IsFixedLength();
            entity.Property(e => e.MaThanhPhan).IsFixedLength();

            entity.HasOne(d => d.MaDichVuNavigation).WithMany(p => p.DichVuThanhPhans)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DichVuTha__MaDic__5CD6CB2B");

            entity.HasOne(d => d.MaThanhPhanNavigation).WithMany(p => p.DichVuThanhPhans)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DichVuTha__MaTha__5DCAEF64");
        });

        modelBuilder.Entity<DonDat>(entity =>
        {
            entity.HasKey(e => e.MaDon).HasName("PK__DonDat__3D89F5684B54DF94");

            entity.Property(e => e.MaDon).IsFixedLength();
            entity.Property(e => e.MaKhachhang).IsFixedLength();
            entity.Property(e => e.MaNhanVien).IsFixedLength();

            entity.HasOne(d => d.MaKhachhangNavigation).WithMany(p => p.DonDatMaKhachhangNavigations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonDat__MaKhachh__60A75C0F");

            entity.HasOne(d => d.MaNhanVienNavigation).WithMany(p => p.DonDatMaNhanVienNavigations).HasConstraintName("FK__DonDat__MaNhanVi__619B8048");
        });

        modelBuilder.Entity<DonDatDichVu>(entity =>
        {
            entity.HasKey(e => e.MaDonDatDichVu).HasName("PK__DonDatDi__71609B63F0412D2F");

            entity.Property(e => e.MaDonDatDichVu).IsFixedLength();
            entity.Property(e => e.MaDichVu).IsFixedLength();
            entity.Property(e => e.MaDon).IsFixedLength();

            entity.HasOne(d => d.MaDichVuNavigation).WithMany(p => p.DonDatDichVus)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonDatDic__MaDic__656C112C");

            entity.HasOne(d => d.MaDonNavigation).WithMany(p => p.DonDatDichVus)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonDatDic__MaDon__6477ECF3");
        });

        modelBuilder.Entity<HoSoNguoiGiupViec>(entity =>
        {
            entity.HasKey(e => e.MaHoSo).HasName("PK__HoSoNguo__1666423C6AB7ED89");

            entity.Property(e => e.MaHoSo).IsFixedLength();
            entity.Property(e => e.MaNguoiGiupViec).IsFixedLength();

            entity.HasOne(d => d.MaNguoiGiupViecNavigation).WithMany(p => p.HoSoNguoiGiupViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__HoSoNguoi__MaNgu__440B1D61");
        });

        modelBuilder.Entity<KhieuNai>(entity =>
        {
            entity.HasKey(e => e.MaKhieuNai).HasName("PK__KhieuNai__1D72BE52427537A7");

            entity.Property(e => e.MaKhieuNai).IsFixedLength();
            entity.Property(e => e.MaDon).IsFixedLength();
            entity.Property(e => e.MaKhachHang).IsFixedLength();
            entity.Property(e => e.MaNhanVien).IsFixedLength();
            entity.Property(e => e.ThoiGian).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.TrangThai).HasDefaultValue("Chờ xử lý");

            entity.HasOne(d => d.MaDonNavigation).WithMany(p => p.KhieuNais)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KhieuNai__MaDon__797309D9");

            entity.HasOne(d => d.MaKhachHangNavigation).WithMany(p => p.KhieuNaiMaKhachHangNavigations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KhieuNai__MaKhac__7A672E12");

            entity.HasOne(d => d.MaNhanVienNavigation).WithMany(p => p.KhieuNaiMaNhanVienNavigations).HasConstraintName("FK__KhieuNai__MaNhan__7B5B524B");
        });

        modelBuilder.Entity<KyNang>(entity =>
        {
            entity.HasKey(e => e.MaKyNang).HasName("PK__KyNang__796CFDAF915A4CD7");

            entity.Property(e => e.MaKyNang).IsFixedLength();
        });

        modelBuilder.Entity<KyNangNguoiGiupViec>(entity =>
        {
            entity.HasKey(e => new { e.MaKyNang, e.MaHoSo }).HasName("PK__KyNangNg__A80A998CAB9D91C2");

            entity.Property(e => e.MaKyNang).IsFixedLength();
            entity.Property(e => e.MaHoSo).IsFixedLength();

            entity.HasOne(d => d.MaHoSoNavigation).WithMany(p => p.KyNangNguoiGiupViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KyNangNgu__MaHoS__534D60F1");

            entity.HasOne(d => d.MaKyNangNavigation).WithMany(p => p.KyNangNguoiGiupViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KyNangNgu__MaKyN__52593CB8");
        });

        modelBuilder.Entity<LichRanh>(entity =>
        {
            entity.HasKey(e => e.MaLichRanh).HasName("PK__LichRanh__0942D646C2A69FC0");

            entity.Property(e => e.MaLichRanh).IsFixedLength();
            entity.Property(e => e.MaNguoiGiupViec).IsFixedLength();

            entity.HasOne(d => d.MaNguoiGiupViecNavigation).WithMany(p => p.LichRanhs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__LichRanh__MaNguo__48CFD27E");
        });

        modelBuilder.Entity<LichRanhCaLamViec>(entity =>
        {
            entity.HasKey(e => new { e.MaLichRanh, e.MaCaLamViec }).HasName("PK__LichRanh__47168924A81DC2A7");

            entity.Property(e => e.MaLichRanh).IsFixedLength();
            entity.Property(e => e.MaCaLamViec).IsFixedLength();
            entity.Property(e => e.ThoiGianTao).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.MaCaLamViecNavigation).WithMany(p => p.LichRanhCaLamViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__LichRanhC__MaCaL__4D94879B");

            entity.HasOne(d => d.MaLichRanhNavigation).WithMany(p => p.LichRanhCaLamViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__LichRanhC__MaLic__4CA06362");
        });

        modelBuilder.Entity<LichSuTrangThaiDon>(entity =>
        {
            entity.HasKey(e => e.MaLichSu).HasName("PK__LichSuTr__C443222A08A05449");

            entity.Property(e => e.MaLichSu).IsFixedLength();
            entity.Property(e => e.MaDon).IsFixedLength();

            entity.HasOne(d => d.MaDonNavigation).WithMany(p => p.LichSuTrangThaiDons)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__LichSuTra__MaDon__71D1E811");
        });

        modelBuilder.Entity<NgayLamViec>(entity =>
        {
            entity.HasKey(e => e.MaNgayLamViec).HasName("PK__NgayLamV__8377D20656EBFEB8");

            entity.Property(e => e.MaNgayLamViec).IsFixedLength();
            entity.Property(e => e.MaDonDatDichVu).IsFixedLength();
            entity.Property(e => e.MaNguoiGiupViec).IsFixedLength();

            entity.HasOne(d => d.MaDonDatDichVuNavigation).WithMany(p => p.NgayLamViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__NgayLamVi__MaDon__68487DD7");

            entity.HasOne(d => d.MaNguoiGiupViecNavigation).WithMany(p => p.NgayLamViecs).HasConstraintName("FK__NgayLamVi__MaNgu__693CA210");
        });

        modelBuilder.Entity<NguoiDung>(entity =>
        {
            entity.HasKey(e => e.MaNguoiDung).HasName("PK__NguoiDun__C539D7626B555869");

            entity.Property(e => e.MaNguoiDung).IsFixedLength();
            entity.Property(e => e.NgayTao).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.NgayTaoRefreshToken).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.TrangThai).HasDefaultValue(true);
        });

        modelBuilder.Entity<NguoiDungVaiTro>(entity =>
        {
            entity.HasKey(e => new { e.MaNguoiDung, e.MaVaiTro }).HasName("PK__NguoiDun__291D137E1AE45F97");

            entity.Property(e => e.MaNguoiDung).IsFixedLength();
            entity.Property(e => e.MaVaiTro).IsFixedLength();
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
            entity.HasKey(e => e.MaThanhPhan).HasName("PK__ThanhPha__B84B504E92116D6C");

            entity.Property(e => e.MaThanhPhan).IsFixedLength();
        });

        modelBuilder.Entity<ThanhToan>(entity =>
        {
            entity.HasKey(e => e.MaThanhToan).HasName("PK__ThanhToa__D4B2584484788329");

            entity.Property(e => e.MaThanhToan).IsFixedLength();
            entity.Property(e => e.MaDon).IsFixedLength();

            entity.HasOne(d => d.MaDonNavigation).WithMany(p => p.ThanhToans)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ThanhToan__MaDon__6EF57B66");
        });

        modelBuilder.Entity<ThuNhapNguoiGiupViec>(entity =>
        {
            entity.HasKey(e => e.MaThuNhap).HasName("PK__ThuNhapN__959076B212B93EF1");

            entity.Property(e => e.MaThuNhap).IsFixedLength();
            entity.Property(e => e.MaNgayLamViec).IsFixedLength();

            entity.HasOne(d => d.MaNgayLamViecNavigation).WithMany(p => p.ThuNhapNguoiGiupViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ThuNhapNg__MaNga__6C190EBB");
        });

        modelBuilder.Entity<VaiTro>(entity =>
        {
            entity.HasKey(e => e.MaVaiTro).HasName("PK__VaiTro__C24C41CF08D3A01B");

            entity.Property(e => e.MaVaiTro).IsFixedLength();
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
