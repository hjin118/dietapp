class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.today = new Date();
        
        this.loadRecords();
        this.loadSettings();
        
        this.init();
    }

    init() {
        this.renderCalendar();
        this.bindEvents();
        this.bindModalEvents();
        this.bindGraphEvents();
        this.bindSettingsEvents();
        this.bindDarkModeEvents();
    }

    loadSettings() {
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('darkModeToggle').textContent = '☀️';
        }
    }

    loadRecords() {
        const saved = localStorage.getItem('dietRecords');
        if (saved) {
            this.records = JSON.parse(saved);
        } else {
            this.records = {};
        }
        this.updateRecordedDates();
    }

    saveRecords() {
        localStorage.setItem('dietRecords', JSON.stringify(this.records));
        this.updateRecordedDates();
    }

    updateRecordedDates() {
        this.recordedDates = new Set(Object.keys(this.records));
    }

    getRecord(dateStr) {
        return this.records[dateStr] || null;
    }

    bindEvents() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.renderCalendar();
        });
    }

    bindDarkModeEvents() {
        const toggleBtn = document.getElementById('darkModeToggle');
        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            toggleBtn.textContent = isDarkMode ? '☀️' : '🌙';
            localStorage.setItem('darkMode', isDarkMode);
        });
    }

    bindSettingsEvents() {
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeBtns = settingsModal.querySelectorAll('.close-btn');
        const exportJsonBtn = document.getElementById('exportJsonBtn');
        const exportMarkdownBtn = document.getElementById('exportMarkdownBtn');
        const importInput = document.getElementById('importInput');
        const clearDataBtn = document.getElementById('clearDataBtn');

        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.add('show');
        });

        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                settingsModal.classList.remove('show');
            });
        });

        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.remove('show');
            }
        });

        exportJsonBtn.addEventListener('click', () => {
            this.exportJson();
        });

        exportMarkdownBtn.addEventListener('click', () => {
            this.exportMarkdown();
        });

        importInput.addEventListener('change', (e) => {
            this.importData(e);
        });

        clearDataBtn.addEventListener('click', () => {
            if (confirm('모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                this.clearAllData();
            }
        });
    }

    exportJson() {
        const data = JSON.stringify(this.records, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diet_records_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportMarkdown() {
        let markdown = '# 다이어트 기록\n\n';
        markdown += `내보내기 날짜: ${new Date().toLocaleDateString('ko-KR')}\n\n`;

        const sortedDates = Object.keys(this.records).sort();
        
        sortedDates.forEach(date => {
            const record = this.records[date];
            markdown += `## ${date}\n\n`;
            
            if (record.weight) {
                markdown += `- **체중**: ${record.weight}kg\n`;
            }
            
            if (record.meals) {
                markdown += `- **식사**: ${record.meals}\n`;
            }
            
            if (record.exercise) {
                markdown += `- **운동**: ${record.exercise}\n`;
            }
            
            if (record.photo) {
                markdown += `- **사진**: 첨부됨\n`;
            }
            
            markdown += '\n---\n\n';
        });

        const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diet_records_${new Date().toISOString().split('T')[0]}.md`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (typeof data === 'object' && data !== null) {
                    if (confirm('기존 데이터를 덮어씌우시겠습니까?')) {
                        this.records = data;
                        this.saveRecords();
                        this.renderCalendar();
                        alert('데이터를 성공적으로 가져왔습니다.');
                    }
                } else {
                    alert('잘못된 파일 형식입니다.');
                }
            } catch (error) {
                alert('파일을 읽는 중 오류가 발생했습니다.');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    clearAllData() {
        this.records = {};
        this.saveRecords();
        this.renderCalendar();
        alert('모든 데이터가 삭제되었습니다.');
    }

    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    }

    formatDate(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    isToday(year, month, day) {
        return year === this.today.getFullYear() &&
               month === this.today.getMonth() &&
               day === this.today.getDate();
    }

    hasRecord(year, month, day) {
        const dateStr = this.formatDate(year, month, day);
        return this.recordedDates.has(dateStr);
    }

    handleDayClick(year, month, day) {
        const dateStr = this.formatDate(year, month, day);
        this.openModal(year, month, day);
    }

    bindModalEvents() {
        const modal = document.getElementById('recordModal');
        const closeBtn = document.querySelector('.close-btn');
        const saveBtn = document.getElementById('saveBtn');
        const photoInput = document.getElementById('photoInput');

        closeBtn.addEventListener('click', () => {
            this.closeModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        saveBtn.addEventListener('click', () => {
            this.saveRecord();
        });

        photoInput.addEventListener('change', (e) => {
            this.handlePhotoUpload(e);
        });
    }

    openModal(year, month, day) {
        const modal = document.getElementById('recordModal');
        const modalDate = document.getElementById('modalDate');
        const dateStr = this.formatDate(year, month, day);

        modalDate.textContent = `날짜: ${dateStr}`;
        modal.dataset.date = dateStr;

        const record = this.getRecord(dateStr);
        if (record) {
            document.getElementById('weightInput').value = record.weight || '';
            document.getElementById('mealsInput').value = record.meals || '';
            document.getElementById('exerciseInput').value = record.exercise || '';
            if (record.photo) {
                this.showPhotoPreview(record.photo);
            } else {
                this.clearPhotoPreview();
            }
        } else {
            document.getElementById('weightInput').value = '';
            document.getElementById('mealsInput').value = '';
            document.getElementById('exerciseInput').value = '';
            this.clearPhotoPreview();
        }

        modal.classList.add('show');
    }

    closeModal() {
        const modal = document.getElementById('recordModal');
        modal.classList.remove('show');
        this.clearPhotoPreview();
    }

    saveRecord() {
        const modal = document.getElementById('recordModal');
        const dateStr = modal.dataset.date;

        const weight = document.getElementById('weightInput').value.trim();
        const meals = document.getElementById('mealsInput').value.trim();
        const exercise = document.getElementById('exerciseInput').value.trim();
        const photoPreview = document.getElementById('photoPreview');

        if (weight || meals || exercise || modal.dataset.photo) {
            this.records[dateStr] = {
                date: dateStr,
                weight: weight,
                meals: meals,
                exercise: exercise,
                photo: modal.dataset.photo || null
            };
        } else {
            delete this.records[dateStr];
        }

        this.saveRecords();
        this.renderCalendar();
        this.drawGraph();
        this.closeModal();
    }

    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드 가능합니다.');
            return;
        }

        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('파일 크기는 2MB 이하여야 합니다.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            this.compressImage(base64, (compressed) => {
                this.showPhotoPreview(compressed);
                document.getElementById('recordModal').dataset.photo = compressed;
            });
        };
        reader.readAsDataURL(file);
    }

    compressImage(base64, callback) {
        const img = new Image();
        img.src = base64;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxWidth = 800;
            const scale = maxWidth / img.width;
            const width = img.width > maxWidth ? maxWidth : img.width;
            const height = img.width > maxWidth ? img.height * scale : img.height;

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            callback(canvas.toDataURL('image/jpeg', 0.7));
        };
    }

    showPhotoPreview(base64) {
        const preview = document.getElementById('photoPreview');
        preview.innerHTML = `
            <img src="${base64}" alt="사진 미리보기">
        `;
        preview.classList.add('has-image');
    }

    clearPhotoPreview() {
        const preview = document.getElementById('photoPreview');
        const photoInput = document.getElementById('photoInput');
        const modal = document.getElementById('recordModal');

        preview.innerHTML = '<div class="placeholder">사진을 선택하면 미리보기가 표시됩니다</div>';
        preview.classList.remove('has-image');
        photoInput.value = '';
        delete modal.dataset.photo;
    }

    bindGraphEvents() {
        const toggleBtn = document.getElementById('toggleGraphBtn');
        const graphContainer = document.getElementById('graphContainer');

        toggleBtn.addEventListener('click', () => {
            graphContainer.classList.toggle('show');
            if (graphContainer.classList.contains('show')) {
                this.drawGraph();
            }
        });
    }

    getWeightData() {
        const data = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = this.formatDate(date.getFullYear(), date.getMonth(), date.getDate());
            
            const record = this.getRecord(dateStr);
            if (record && record.weight) {
                data.push({
                    date: dateStr,
                    weight: parseFloat(record.weight),
                    day: date.getDate()
                });
            }
        }
        
        return data;
    }

    drawGraph() {
        const canvas = document.getElementById('weightGraph');
        const ctx = canvas.getContext('2d');
        
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        const width = rect.width;
        const height = rect.height;
        const padding = { top: 30, right: 30, bottom: 40, left: 50 };
        
        ctx.clearRect(0, 0, width, height);
        
        const data = this.getWeightData();
        
        if (data.length === 0) {
            ctx.fillStyle = '#999';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('체중 기록이 없습니다', width / 2, height / 2);
            return;
        }
        
        const weights = data.map(d => d.weight);
        const minWeight = Math.floor(Math.min(...weights) - 1);
        const maxWeight = Math.ceil(Math.max(...weights) + 1);
        
        const xScale = (width - padding.left - padding.right) / (data.length - 1 || 1);
        const yScale = (height - padding.top - padding.bottom) / (maxWeight - minWeight);
        
        const getX = (index) => padding.left + index * xScale;
        const getY = (weight) => padding.top + (maxWeight - weight) * yScale;
        
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        
        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const weight = minWeight + (maxWeight - minWeight) * (i / ySteps);
            const y = getY(weight);
            
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
            
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(weight.toFixed(1) + 'kg', padding.left - 10, y + 4);
        }
        
        if (data.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            data.forEach((d, i) => {
                const x = getX(i);
                const y = getY(d.weight);
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
        }
        
        data.forEach((d, i) => {
            const x = getX(i);
            const y = getY(d.weight);
            
            ctx.beginPath();
            ctx.fillStyle = '#667eea';
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.fillStyle = 'white';
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
            
            const parts = d.date.split('-');
            ctx.fillStyle = '#999';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${parts[1]}/${parts[2]}`, x, height - padding.bottom + 15);
        });
    }

    renderCalendar() {
        const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
        document.getElementById('currentMonth').textContent = `${this.currentYear}년 ${monthNames[this.currentMonth]}`;

        const calendarGrid = document.getElementById('calendarGrid');
        calendarGrid.innerHTML = '';

        const daysInMonth = this.getDaysInMonth(this.currentYear, this.currentMonth);
        const firstDay = this.getFirstDayOfMonth(this.currentYear, this.currentMonth);

        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            calendarGrid.appendChild(emptyDay);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            dayElement.textContent = day;

            if (this.isToday(this.currentYear, this.currentMonth, day)) {
                dayElement.classList.add('current-day');
            }

            if (this.hasRecord(this.currentYear, this.currentMonth, day)) {
                dayElement.classList.add('has-record');
            }

            dayElement.addEventListener('click', () => {
                this.handleDayClick(this.currentYear, this.currentMonth, day);
            });

            calendarGrid.appendChild(dayElement);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Calendar();
});