import Swal from "sweetalert2";

export const toast = {
  success: (message: string, title: string = "Thành công!") => {
    Swal.fire({
      icon: "success",
      title,
      text: message,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
    });
  },

  error: (message: string, title: string = "Lỗi!") => {
    Swal.fire({
      icon: "error",
      title,
      text: message,
      timer: 4000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
    });
  },

  warning: (message: string, title: string = "Cảnh báo!") => {
    Swal.fire({
      icon: "warning",
      title,
      text: message,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
    });
  },

  info: (message: string, title: string = "Thông báo") => {
    Swal.fire({
      icon: "info",
      title,
      text: message,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
    });
  },

  confirm: async (
    message: string,
    title: string = "Xác nhận",
  ): Promise<boolean> => {
    const result = await Swal.fire({
      icon: "question",
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#64748b",
    });
    return result.isConfirmed;
  },
};
