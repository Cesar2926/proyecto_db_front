import api from './api';

export const reporteService = {
  downloadReporteGeneral: async () => {
    try {
      const response = await api.get('/reportes/general', {
        responseType: 'blob', // Important for handling binary data
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reporte_general.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading general report:', error);
      throw error;
    }
  },

  downloadReporteCaso: async (id: string) => {
    try {
      const response = await api.get(`/reportes/caso/${id}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_caso_${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading case report:', error);
      throw error;
    }
  }
};
