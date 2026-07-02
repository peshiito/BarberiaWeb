export const DateUtils = {
    getWeekStart(date: Date = new Date()): Date {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    },

    getWeekEnd(date: Date = new Date()): Date {
        const d = this.getWeekStart(date);
        d.setDate(d.getDate() + 6);
        d.setHours(23, 59, 59, 999);
        return d;
    },

    formatDate(date: Date): string {
        return date.toISOString().split("T")[0];
    },

    formatTime(time: string): string {
        return time.slice(0, 5);
    },

    isValidTime(time: string): boolean {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
    },

    generateSlots(startTime: string, endTime: string, intervalMinutes: number): string[] {
        const slots: string[] = [];
        let current = new Date(`1970-01-01T${startTime}`);
        const end = new Date(`1970-01-01T${endTime}`);

        while (current < end) {
            slots.push(current.toTimeString().slice(0, 5));
            current.setMinutes(current.getMinutes() + intervalMinutes);
        }

        return slots;
    },
};
