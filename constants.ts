export const MEMOS_CONFIG = {
  USER_ID: "sam.qin@xiaoyibao.com.cn",
  API_KEY: "mpg-XTF8X0lKOJVUpewkyvdL1GwR1T7MebYrgzJ3zhWo",
  BASE_URL: "https://memos.memtensor.cn/api/openmem/v1"
};

export const INITIAL_RECORDS = [
  { id: '1', date: '2023-11-01', type: 'Complex', indicators: { 'CA199': 358.8, 'ALP': 76, 'HGB': 132, 'WBC': 7.3 } },
  { id: '2', date: '2023-11-15', type: 'Complex', indicators: { 'CA199': 540.3, 'ALP': 135, 'ALT': 52.4, 'WBC': 8.5 } },
];

export const INDICATOR_METADATA = [
  // 肿瘤标志物
  { key: 'CA199', label: 'CA19-9', unit: 'U/mL', category: 'Tumor' },
  { key: 'CEA', label: '癌胚抗原', unit: 'ng/mL', category: 'Tumor' },
  
  // 血常规 (全项映射)
  { key: 'WBC', label: '白细胞', unit: '10^9/L', category: 'Blood' },
  { key: 'NEU_P', label: '中性粒%', unit: '%', category: 'Blood' },
  { key: 'LYM_P', label: '淋巴%', unit: '%', category: 'Blood' },
  { key: 'HGB', label: '血红蛋白', unit: 'g/L', category: 'Blood' },
  { key: 'PLT', label: '血小板', unit: '10^9/L', category: 'Blood' },
  { key: 'NLR', label: 'NLR(中性/淋巴)', unit: '', category: 'Blood' },

  // 肝肾功能与生化
  { key: 'ALT', label: '谷丙转氨酶', unit: 'U/L', category: 'Liver' },
  { key: 'AST', label: '谷草转氨酶', unit: 'U/L', category: 'Liver' },
  { key: 'ALP', label: '碱性磷酸酶', unit: 'U/L', category: 'Liver' },
  { key: 'GGT', label: '谷氨酰转肽酶', unit: 'U/L', category: 'Liver' },
  { key: 'TBIL', label: '总胆红素', unit: 'μmol/L', category: 'Liver' },
  { key: 'DBIL', label: '直接胆红素', unit: 'μmol/L', category: 'Liver' },
  { key: 'ALB', label: '白蛋白', unit: 'g/L', category: 'Liver' },
  { key: 'PA', label: '前白蛋白', unit: 'mg/L', category: 'Liver' },
  { key: 'LDH', label: '乳酸脱氢酶', unit: 'U/L', category: 'Liver' },
  { key: 'UREA', label: '尿素', unit: 'mmol/L', category: 'Renal' },
  { key: 'CREA', label: '肌酐', unit: 'μmol/L', category: 'Renal' },
  { key: 'UA', label: '尿酸', unit: 'μmol/L', category: 'Renal' },
  { key: 'GLU', label: '血糖', unit: 'mmol/L', category: 'Metabolism' },

  // 免疫亚群
  { key: 'T_CELL_P', label: 'T淋巴细胞%', unit: '%', category: 'Bio' },
  { key: 'CD4_P', label: '辅助T(CD4+)', unit: '%', category: 'Bio' },
  { key: 'CD8_P', label: '抑制T(CD8+)', unit: '%', category: 'Bio' },
  { key: 'CD4_CD8_RATIO', label: 'CD4/CD8比值', unit: '', category: 'Bio' },
  { key: 'TREG_P', label: '调节T细胞%', unit: '%', category: 'Bio' },
  { key: 'CD8_PD1_P', label: 'CD8+PD1+%', unit: '%', category: 'Bio' }
];