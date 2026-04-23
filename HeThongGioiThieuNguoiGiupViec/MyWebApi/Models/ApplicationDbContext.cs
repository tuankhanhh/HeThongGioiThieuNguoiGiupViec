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
        => optionsBuilder.UseSqlServer("Data Source=PHUVO\\SQLEXPRESS;Initial Catalog=dbHeThongGioiThieuNguoiGiupViec;Integrated Security=True;Persist Security Info=False;Pooling=False;Multiple Active Result Sets=False;Encrypt=False;Trust Server Certificate=True;Command Timeout=0");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CaLamViec>(entity =>
        {
            entity.HasKey(e => e.MaCaLamViec).HasName("PK__CaLamVie__E545F62570321C52");

            entity.Property(e => e.MaCaLamViec).IsFixedLength();
        });

        modelBuilder.Entity<DanhGium>(entity =>
        {
            entity.HasKey(e => e.MaDanhGia).HasName("PK__DanhGia__AA9515BFB5BEDEB3");

            entity.HasOne(d => d.MaDonNavigation).WithMany(p => p.DanhGia)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DanhGia__MaDon__76969D2E");
        });

        modelBuilder.Entity<DichVu>(entity =>
        {
            entity.HasKey(e => e.MaDichVu).HasName("PK__DichVu__C0E6DE8F945BFD48");

            entity.Property(e => e.PhoBien).HasDefaultValue(false);
            entity.Property(e => e.TrangThai).HasDefaultValue("Đang hoạt động");
        });

        modelBuilder.Entity<DichVuThanhPhan>(entity =>
        {
            entity.HasKey(e => new { e.MaDichVu, e.MaThanhPhan }).HasName("PK__DichVuTh__3B626B8B0117B029");

            entity.HasOne(d => d.MaDichVuNavigation).WithMany(p => p.DichVuThanhPhans)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DichVuTha__MaDic__5AEE82B9");

            entity.HasOne(d => d.MaThanhPhanNavigation).WithMany(p => p.DichVuThanhPhans)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DichVuTha__MaTha__5BE2A6F2");
        });

        modelBuilder.Entity<DonDat>(entity =>
        {
            entity.HasKey(e => e.MaDon).HasName("PK__DonDat__3D89F56819979E28");

            entity.HasOne(d => d.MaKhachhangNavigation).WithMany(p => p.DonDatMaKhachhangNavigations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonDat__MaKhachh__5EBF139D");

            entity.HasOne(d => d.MaNhanVienNavigation).WithMany(p => p.DonDatMaNhanVienNavigations).HasConstraintName("FK__DonDat__MaNhanVi__5FB337D6");
        });

        modelBuilder.Entity<DonDatDichVu>(entity =>
        {
            entity.HasKey(e => e.MaDonDatDichVu).HasName("PK__DonDatDi__71609B63AB7ACA69");

            entity.HasOne(d => d.MaDichVuNavigation).WithMany(p => p.DonDatDichVus)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonDatDic__MaDic__6383C8BA");

            entity.HasOne(d => d.MaDonNavigation).WithMany(p => p.DonDatDichVus)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonDatDic__MaDon__628FA481");
        });

        modelBuilder.Entity<DonDatDichVuNgayLamViec>(entity =>
        {
            entity.HasKey(e => new { e.MaDonDatDichVu, e.MaNgayLamViec }).HasName("PK__DonDatDi__0957E6439CE23A8F");

            entity.HasOne(d => d.MaDonDatDichVuNavigation).WithMany(p => p.DonDatDichVuNgayLamViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonDatDic__MaDon__6A30C649");

            entity.HasOne(d => d.MaNgayLamViecNavigation).WithMany(p => p.DonDatDichVuNgayLamViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonDatDic__MaNga__6B24EA82");
        });

        modelBuilder.Entity<HoSoNguoiGiupViec>(entity =>
        {
            entity.HasKey(e => e.MaHoSo).HasName("PK__HoSoNguo__1666423C7738B55F");

            entity.HasOne(d => d.MaNguoiGiupViecNavigation).WithMany(p => p.HoSoNguoiGiupViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__HoSoNguoi__MaNgu__440B1D61");
        });

        modelBuilder.Entity<KhieuNai>(entity =>
        {
            entity.HasKey(e => e.MaKhieuNai).HasName("PK__KhieuNai__1D72BE52B3A90C5F");

            entity.Property(e => e.ThoiGian).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.TrangThai).HasDefaultValue("Chưa xử lý");

            entity.HasOne(d => d.MaDonNavigation).WithMany(p => p.KhieuNais)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KhieuNai__MaDon__7C4F7684");

            entity.HasOne(d => d.MaKhachHangNavigation).WithMany(p => p.KhieuNaiMaKhachHangNavigations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KhieuNai__MaKhac__7D439ABD");

            entity.HasOne(d => d.MaNhanVienNavigation).WithMany(p => p.KhieuNaiMaNhanVienNavigations).HasConstraintName("FK__KhieuNai__MaNhan__7E37BEF6");
        });

        modelBuilder.Entity<KyNang>(entity =>
        {
            entity.HasKey(e => e.MaKyNang).HasName("PK__KyNang__796CFDAFA611FF38");
        });

        modelBuilder.Entity<KyNangNguoiGiupViec>(entity =>
        {
            entity.HasKey(e => new { e.MaKyNang, e.MaHoSo }).HasName("PK__KyNangNg__A80A998C0B0835A0");

            entity.Property(e => e.NgayThem).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.MaHoSoNavigation).WithMany(p => p.KyNangNguoiGiupViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KyNangNgu__MaHoS__52593CB8");

            entity.HasOne(d => d.MaKyNangNavigation).WithMany(p => p.KyNangNguoiGiupViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__KyNangNgu__MaKyN__5165187F");
        });

        modelBuilder.Entity<LichRanh>(entity =>
        {
            entity.HasKey(e => e.MaLichRanh).HasName("PK__LichRanh__0942D646BFCA8B94");

            entity.Property(e => e.MaLichRanh).IsFixedLength();
            entity.Property(e => e.MaNguoiGiupViec).IsFixedLength();
        });

        modelBuilder.Entity<LichRanhCaLamViec>(entity =>
        {
            entity.HasKey(e => new { e.MaLichRanh, e.MaCaLamViec }).HasName("PK__LichRanh__471689242592CECB");

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
            entity.HasKey(e => e.MaLichSu).HasName("PK__LichSuTr__C443222A910417D0");

            entity.HasOne(d => d.MaDonNavigation).WithMany(p => p.LichSuTrangThaiDons)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__LichSuTra__MaDon__73BA3083");
        });

        modelBuilder.Entity<NgayLamViec>(entity =>
        {
            entity.HasKey(e => e.MaNgayLamViec).HasName("PK__NgayLamV__8377D20608519345");

            entity.HasOne(d => d.MaDonDatDichVuNavigation).WithMany(p => p.NgayLamViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__NgayLamVi__MaDon__66603565");

            entity.HasOne(d => d.MaNguoiGiupViecNavigation).WithMany(p => p.NgayLamViecs).HasConstraintName("FK__NgayLamVi__MaNgu__6754599E");
        });

        modelBuilder.Entity<NguoiDung>(entity =>
        {
            entity.HasKey(e => e.MaNguoiDung).HasName("PK__NguoiDun__C539D762AFB38EDC");

            entity.Property(e => e.NgayTao).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.NgayTaoRefreshToken).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.TrangThai).HasDefaultValue(true);
        });

        modelBuilder.Entity<NguoiDungVaiTro>(entity =>
        {
            entity.HasKey(e => new { e.MaNguoiDung, e.MaVaiTro }).HasName("PK__NguoiDun__291D137EED2D2B6C");

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
            entity.HasKey(e => e.MaThanhPhan).HasName("PK__ThanhPha__B84B504EF122DBF5");
        });

        modelBuilder.Entity<ThanhToan>(entity =>
        {
            entity.HasKey(e => e.MaThanhToan).HasName("PK__ThanhToa__D4B25844A067A027");

            entity.HasOne(d => d.MaDonNavigation).WithMany(p => p.ThanhToans)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ThanhToan__MaDon__70DDC3D8");
        });

        modelBuilder.Entity<ThuNhapNguoiGiupViec>(entity =>
        {
            entity.HasKey(e => e.MaThuNhap).HasName("PK__ThuNhapN__959076B2DA74F176");

            entity.HasOne(d => d.MaNgayLamViecNavigation).WithMany(p => p.ThuNhapNguoiGiupViecs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ThuNhapNg__MaNga__6E01572D");
        });

        modelBuilder.Entity<VaiTro>(entity =>
        {
            entity.HasKey(e => e.MaVaiTro).HasName("PK__VaiTro__C24C41CF89E63C62");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
