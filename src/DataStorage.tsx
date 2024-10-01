export const saveData = (data: any) => {
    localStorage.setItem('chartData', JSON.stringify(data));
};

export const loadData = () => {
    const data = localStorage.getItem('chartData');
    return data ? JSON.parse(data) : null;
};
