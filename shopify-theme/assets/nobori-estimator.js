/**
 * のぼり製作 見積もりシステム
 * Shopify商品データから動的に価格計算
 */

class NoboriEstimator {
  constructor() {
    this.data = window.NOBORI_DATA;
    this.currentStep = 1;
    this.files = [];

    this.state = {
      sizeHandle: '',
      fabricSku: '',
      quantity: 1,
      options: []
    };

    this.init();
  }

  init() {
    // 初期値設定
    const firstSize = document.querySelector('input[name="size"]:checked');
    if (firstSize) {
      this.state.sizeHandle = firstSize.value;
      this.updateFabricList();
    }

    this.attachEventListeners();
    this.updatePrice();
  }

  attachEventListeners() {
    // サイズ変更
    document.querySelectorAll('input[name="size"]').forEach(input => {
      input.addEventListener('change', (e) => {
        this.state.sizeHandle = e.target.value;
        this.updateFabricList();
        this.updatePrice();
      });
    });

    // 数量変更
    const quantityInput = document.getElementById('quantity');
    quantityInput.addEventListener('input', (e) => {
      this.state.quantity = parseInt(e.target.value) || 1;
      this.updatePrice();
    });

    // クイック数量ボタン
    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const qty = parseInt(e.target.dataset.quantity);
        this.state.quantity = qty;
        quantityInput.value = qty;
        this.updatePrice();

        // アクティブ状態
        document.querySelectorAll('.quick-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // オプション変更
    document.querySelectorAll('input[name="option"]').forEach(input => {
      input.addEventListener('change', (e) => {
        const value = e.target.value;
        if (e.target.checked) {
          this.state.options.push(value);
        } else {
          this.state.options = this.state.options.filter(opt => opt !== value);
        }
        this.updatePrice();
      });
    });

    // ステップナビゲーション
    document.getElementById('btn-next-1').addEventListener('click', () => this.nextStep());
    document.getElementById('btn-next-2').addEventListener('click', () => this.nextStep());
    document.getElementById('btn-back-2').addEventListener('click', () => this.prevStep());
    document.getElementById('btn-back-3').addEventListener('click', () => this.prevStep());
    document.getElementById('btn-submit').addEventListener('click', () => this.handleSubmit());

    // ファイルアップロード
    const fileUploadArea = document.getElementById('file-upload');
    const fileInput = document.getElementById('file-input');

    fileUploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));

    // ドラッグ&ドロップ
    fileUploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileUploadArea.classList.add('drag-over');
    });

    fileUploadArea.addEventListener('dragleave', () => {
      fileUploadArea.classList.remove('drag-over');
    });

    fileUploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      fileUploadArea.classList.remove('drag-over');
      this.handleFileSelect(e.dataTransfer.files);
    });
  }

  updateFabricList() {
    const product = this.data.products[this.state.sizeHandle];
    if (!product) return;

    const fabricList = document.getElementById('fabric-list');
    fabricList.innerHTML = '';

    let firstFabric = null;
    Object.entries(product.variants).forEach(([sku, variant], index) => {
      if (index === 0) firstFabric = sku;

      const label = document.createElement('label');
      label.className = 'fabric-item';
      label.innerHTML = `
        <input type="radio" name="fabric" value="${sku}" ${index === 0 ? 'checked' : ''}>
        <div class="option-card">
          <div class="option-header">
            <h3>${variant.title}</h3>
            <svg class="check-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <p class="card-price">¥${variant.price.toLocaleString()}</p>
        </div>
      `;

      fabricList.appendChild(label);

      // イベントリスナー追加
      const input = label.querySelector('input');
      input.addEventListener('change', (e) => {
        this.state.fabricSku = e.target.value;
        this.updatePrice();
      });
    });

    // 初期値設定
    if (firstFabric) {
      this.state.fabricSku = firstFabric;
      this.updatePrice();
    }
  }

  calculatePrice() {
    const product = this.data.products[this.state.sizeHandle];
    if (!product || !this.state.fabricSku) {
      return {
        basePrice: 0,
        optionsCost: 0,
        subtotal: 0,
        discountAmount: 0,
        totalPrice: 0,
        unitPrice: 0,
        discountLabel: ''
      };
    }

    const variant = product.variants[this.state.fabricSku];
    if (!variant) {
      return {
        basePrice: 0,
        optionsCost: 0,
        subtotal: 0,
        discountAmount: 0,
        totalPrice: 0,
        unitPrice: 0,
        discountLabel: ''
      };
    }

    // 基本料金
    const basePrice = variant.price * this.state.quantity;

    // オプション料金
    const optionsTotal = this.state.options.reduce((sum, opt) => {
      return sum + (this.data.options[opt] || 0);
    }, 0);
    const optionsCost = optionsTotal * this.state.quantity;

    // 小計
    const subtotal = basePrice + optionsCost;

    // 数量割引
    const discountRule = this.data.discounts.find(
      d => this.state.quantity >= d.min && this.state.quantity <= d.max
    );
    const discountAmount = Math.floor(subtotal * discountRule.rate);
    const discountLabel = discountRule.label;

    // 合計
    const totalPrice = subtotal - discountAmount;
    const unitPrice = Math.floor(totalPrice / this.state.quantity);

    return {
      variant,
      basePrice,
      optionsCost,
      subtotal,
      discountAmount,
      totalPrice,
      unitPrice,
      discountLabel
    };
  }

  updatePrice() {
    const result = this.calculatePrice();

    // 基本料金
    document.getElementById('price-base').textContent = `¥${result.basePrice.toLocaleString()}`;

    // オプション料金
    if (result.optionsCost > 0) {
      document.getElementById('price-options-wrapper').style.display = 'flex';
      document.getElementById('price-options').textContent = `¥${result.optionsCost.toLocaleString()}`;
    } else {
      document.getElementById('price-options-wrapper').style.display = 'none';
    }

    // 割引
    if (result.discountAmount > 0) {
      document.getElementById('price-discount-wrapper').style.display = 'flex';
      document.getElementById('discount-label').textContent = `数量割引 (${result.discountLabel})`;
      document.getElementById('price-discount').textContent = `-¥${result.discountAmount.toLocaleString()}`;
    } else {
      document.getElementById('price-discount-wrapper').style.display = 'none';
    }

    // 合計
    document.getElementById('price-total').textContent = `¥${result.totalPrice.toLocaleString()}`;
    document.getElementById('price-unit').textContent = `¥${result.unitPrice.toLocaleString()}`;
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
      this.updateStepDisplay();

      if (this.currentStep === 3) {
        this.updateOrderSummary();
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateStepDisplay();
    }
  }

  updateStepDisplay() {
    // コンテンツ表示切替
    document.querySelectorAll('.step-content').forEach((content, index) => {
      if (index + 1 === this.currentStep) {
        content.classList.remove('hidden');
      } else {
        content.classList.add('hidden');
      }
    });

    // ステップインジケーター更新
    document.querySelectorAll('.step').forEach((step, index) => {
      const stepNum = index + 1;
      if (stepNum < this.currentStep) {
        step.classList.add('completed');
        step.classList.remove('active');
        const circle = step.querySelector('.step-circle');
        circle.innerHTML = `
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        `;
      } else if (stepNum === this.currentStep) {
        step.classList.add('active');
        step.classList.remove('completed');
        const circle = step.querySelector('.step-circle');
        circle.textContent = stepNum;
      } else {
        step.classList.remove('active', 'completed');
        const circle = step.querySelector('.step-circle');
        circle.textContent = stepNum;
      }
    });

    // ページトップへスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleFileSelect(files) {
    Array.from(files).forEach(file => {
      if (file.size > 50 * 1024 * 1024) { // 50MB制限
        alert(`${file.name} はファイルサイズが大きすぎます（最大50MB）`);
        return;
      }

      this.files.push(file.name);
    });

    this.updateFileList();
  }

  updateFileList() {
    const fileList = document.getElementById('file-list');
    if (this.files.length === 0) {
      fileList.innerHTML = '';
      return;
    }

    fileList.innerHTML = `
      <div class="file-list-header">
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <strong>アップロード済み (${this.files.length})</strong>
      </div>
      <div class="files">
        ${this.files.map((file, index) => `
          <div class="file-item">
            <div class="file-info">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>${file}</span>
            </div>
            <button type="button" class="file-remove" data-index="${index}">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>削除</span>
            </button>
          </div>
        `).join('')}
      </div>
    `;

    // 削除ボタンのイベントリスナー
    fileList.querySelectorAll('.file-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.files.splice(index, 1);
        this.updateFileList();
      });
    });
  }

  updateOrderSummary() {
    const product = this.data.products[this.state.sizeHandle];
    const variant = product?.variants[this.state.fabricSku];
    if (!variant) return;

    const result = this.calculatePrice();

    const summary = document.getElementById('order-summary');
    summary.innerHTML = `
      <div class="summary-item">
        <dt>サイズ</dt>
        <dd>${product.title.replace('のぼり製作（', '').replace('）', '')}</dd>
      </div>
      <div class="summary-item">
        <dt>生地</dt>
        <dd>${variant.title}</dd>
      </div>
      <div class="summary-item">
        <dt>数量</dt>
        <dd>${this.state.quantity}枚</dd>
      </div>
      <div class="summary-item">
        <dt>オプション</dt>
        <dd>${this.state.options.length > 0
          ? this.state.options.map(opt => this.data.optionNames[opt]).join(', ')
          : 'なし'
        }</dd>
      </div>
      <div class="summary-item">
        <dt>データ</dt>
        <dd class="file-status">
          ${this.files.length > 0 ? `
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>${this.files.length}ファイル</span>
          ` : '<span>後日入稿</span>'}
        </dd>
      </div>
    `;
  }

  async handleSubmit() {
    const product = this.data.products[this.state.sizeHandle];
    const variant = product?.variants[this.state.fabricSku];
    if (!variant) {
      alert('商品情報の取得に失敗しました');
      return;
    }

    const result = this.calculatePrice();

    // カスタム属性を準備
    const properties = {
      'サイズ': product.title.replace('のぼり製作（', '').replace('）', ''),
      '生地': variant.title,
      '数量': `${this.state.quantity}枚`,
      'オプション': this.state.options.length > 0
        ? this.state.options.map(opt => this.data.optionNames[opt]).join(', ')
        : 'なし',
      'データ': this.files.length > 0 ? `${this.files.length}ファイル` : '後日入稿',
      '見積金額': `¥${result.totalPrice.toLocaleString()}`
    };

    try {
      // Shopifyカートに追加
      const formData = {
        items: [{
          id: variant.id,
          quantity: 1,
          properties: properties
        }]
      };

      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('カートへの追加に失敗しました');
      }

      // カートページへ遷移
      window.location.href = '/cart';

    } catch (error) {
      console.error('Error:', error);
      alert('注文の処理中にエラーが発生しました。もう一度お試しください。');
    }
  }
}

// DOMロード後に初期化
document.addEventListener('DOMContentLoaded', () => {
  new NoboriEstimator();
});
