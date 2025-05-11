

export const getSelectedTicketsFromURL = (): number[] => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ticketsParam = params.get("tickets");
      if (ticketsParam) {
        return JSON.parse(ticketsParam);
      }
    } catch (error) {
      console.error("Error parsing tickets from URL:", error);
    }
    return [];
  };