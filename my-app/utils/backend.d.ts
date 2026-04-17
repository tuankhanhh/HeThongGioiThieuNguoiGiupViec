export {};

declare global {
  interface IRequest {
    url: string;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: Record<string, unknown> | FormData;
    queryParams?: Record<
      string,
      | string
      | number
      | boolean
      | null
      | undefined
      | Array<string | number | boolean>
    >;
    useCredentials?: boolean;
    headers?: HeadersInit;
    nextOption?: RequestInit & {
      next?: {
        revalidate?: number;
        tags?: string[];
      };
    };
  }

  interface IBackendRes<T> {
    error?: string | string[];
    message: string;
    statusCode: number;
    data?: T;
  }

  interface IModelPaginate<T> {
    meta: {
      current: number;
      pageSize: number;
      pages: number;
      total: number;
    };
    result: T[];
  }

  export interface INguoiDung {
    MaNguoiDung: string;
    HoTen: string;
    Email: string;
    SoDienThoai?: string;
    DiaChi?: string;
    TrangThai: boolean;
    AnhDaiDien?: string;
    NgayTao?: string;
  }

  export interface IVaiTro {
    MaVaiTro: string;
    TenVaiTro: string;
    MoTa?: string;
  }

  export interface INguoiDungVaiTro {
    MaNguoiDung: string;
    MaVaiTro: string;
    NgayGan?: string;
  }
  export interface IHoSoNguoiGiupViec {
    MaHoSo: string;
    MaNguoiGiupViec: string;
    SoCCCD: string;
    NgaySinh: string;
    GioiTinh: string;
    KinhNghiem: string;
    MoTaChiTietKinhNghiem?: string;
    TenNguoiThan?: string;
    SDTNguoiThan?: string;
    AnhCCCDMatTruoc?: string;
    AnhCCCDMatSau?: string;
    AnhChanDung?: string;
    GiayXacNhanCuTru?: string;
    TrangThaiXacMinh: string;
  }

  export interface IKyNang {
    MaKyNang: string;
    TenKyNang: string;
    MoTa?: string;
    IconName?: string;
  }

  export interface ILichRanh {
    MaLichRanh: string;
    MaNguoiGiupViec: string;
    Ngay: string;
    GioBatDau: string;
    GioKetThuc: string;
  }
  export interface IDichVu {
    MaDichVu: string;
    TenDichVu: string;
    MoTa?: string;
    GiaTheoGio: number;
    HinhAnh?: string;
    PhoBien: boolean;
    TrangThai: string;
    ThanhPhan: IThanhPhan[];
  }

  export interface IThanhPhan {
    MaThanhPhan: string;
    TenThanhPhan: string;
  }

  export interface IDichVuThanhPhan {
    MaDichVu: string;
    MaThanhPhan: string;
    GhiChu?: string;
  }
  export interface IDonDat {
    MaDon: string;
    MaKhachhang: string;
    MaNhanVien?: string;
    DiaChi: string;
    SoNgay: number;
    TongTien: number;
    NgayDat: string;
    GhiChu?: string;
  }

  export interface INgayLamViec {
    MaNgayLamViec: string;
    MaDonDatDichVu: string;
    MaNguoiGiupViec?: string;
    GioBatDau?: string;
    NgayLam: string;
  }

  export interface IThanhToan {
    MaThanhToan: string;
    MaDon: string;
    TrangThaiThanhToan: string;
  }

  export interface IDanhGia {
    MaDanhGia: string;
    MaDon: string;
    SoSao: number;
  }

  export interface IThuNhapNguoiGiupViec {
    MaThuNhap: string;
    MaNgayLamViec: string;
    SoTien: number;
  }
  // types/order-request.dto.ts

  export interface ICreateOrderDTO {
    // Dữ liệu cho bảng DonDat
    MaKhachhang: string;
    DiaChi: string;
    SoNgay: number;
    GhiChu?: string;

    // Dữ liệu cho bảng DonDatDichVu (Danh sách các mã dịch vụ)
    DanhSachMaDichVu: string[];

    // Dữ liệu cho bảng NgayLamViec (Danh sách các ca làm)
    LichTrinh: {
      NgayLam: string;
      GioBatDau: string;
    }[];
  }
}
