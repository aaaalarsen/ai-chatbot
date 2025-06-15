import { OptimizedChatFlow, OriginalConfiguration } from '@/types'
import { OpenAIJsonConverter } from '@/services/openaiJsonConverter'

let cachedFlow: OptimizedChatFlow | null = null

export async function getRealBankingFlowFromConfiguration(): Promise<OptimizedChatFlow> {
  // キャッシュがある場合はそれを返す
  if (cachedFlow) {
    return cachedFlow
  }

  try {
    // configuration.jsonを読み込み
    const response = await fetch('/configuration.json')
    const originalConfig: OriginalConfiguration = await response.json()
    
    // OpenAI APIを使用して変換
    const converter = new OpenAIJsonConverter()
    const conversionResult = await converter.convertConfigurationToOptimizedFlow(originalConfig)
    
    if (conversionResult.success && conversionResult.data) {
      cachedFlow = conversionResult.data
      console.log('Configuration converted successfully using OpenAI API')
      if (conversionResult.tokensUsed) {
        console.log(`Tokens used: ${conversionResult.tokensUsed}, Cost: $${conversionResult.cost?.toFixed(4)}`)
      }
      return cachedFlow
    } else {
      console.error('OpenAI conversion failed:', conversionResult.error)
      // フォールバック: 手動で定義されたフローを使用
      return getFallbackBankingFlow()
    }
  } catch (error) {
    console.error('Error loading or converting configuration:', error)
    // フォールバック: 手動で定義されたフローを使用
    return getFallbackBankingFlow()
  }
}

export function getRealBankingFlowFromConfigurationSync(): OptimizedChatFlow {
  // 同期版 - キャッシュがない場合はフォールバックを返す
  return cachedFlow || getFallbackBankingFlow()
}

// キャッシュを更新する関数
export function updateCachedFlow(updatedFlow: OptimizedChatFlow): void {
  cachedFlow = updatedFlow
  console.log('Flow cache updated with new data')
}

// キャッシュをクリアする関数
export function clearFlowCache(): void {
  cachedFlow = null
  console.log('Flow cache cleared')
}

function getFallbackBankingFlow(): OptimizedChatFlow {
  // 実際のconfiguration.jsonに基づいた銀行ATMフロー
  // 音声ファイルが存在するノードには voiceFile プロパティを追加
  const fallbackFlow = {
    "version": "1.0",
    "storeName": "AIアシスタント - 銀行ATM",
    "languages": {
      "ja": {
        "languageSelection": true,
        "settings": {
          "autoStopSeconds": 3,
          "voiceSpeed": 1.0,
          "qrPassword": "1234",
          "qrExpiryMinutes": 30
        },
        "nodes": {
          "start": {
            "id": "start",
            "type": "message",
            "content": "いらっしゃいませ。AIアシスタントをご利用いただき、ありがとうございます。",
            "next": "language_selection",
            "voiceFile": "start_3"
          },
          "language_selection": {
            "id": "language_selection",
            "type": "choice",
            "content": "言語を選択してください。\nPlease select your language.",
            "voiceFile": "language_selection_3",
            "choices": [
              {
                "id": "japanese",
                "text": "日本語",
                "keywords": ["日本語", "にほんご", "Japanese", "jp", "日本"],
                "excludeKeywords": [],
                "next": "transaction_type"
              },
              {
                "id": "english",
                "text": "English",
                "keywords": ["English", "英語", "えいご", "en", "english"],
                "excludeKeywords": [],
                "next": "transaction_type"
              },
              {
                "id": "chinese",
                "text": "中文",
                "keywords": ["中文", "中国語", "Chinese", "zh", "chinese"],
                "excludeKeywords": [],
                "next": "transaction_type"
              }
            ]
          },
          "transaction_type": {
            "id": "transaction_type",
            "type": "choice",
            "content": "ご希望の取引を選択してください。",
            "voiceFile": "transaction_type_3",
            "choices": [
              {
                "id": "deposit",
                "text": "預入",
                "keywords": ["預入", "入金", "預金", "お預け入れ", "よにゅう", "deposit", "預ける"],
                "excludeKeywords": ["出金", "引き出し", "振込"],
                "next": "deposit_amount"
              },
              {
                "id": "payout",
                "text": "払出",
                "keywords": ["払出", "出金", "引き出し", "払い出し", "ひきだし", "withdrawal", "取る"],
                "excludeKeywords": ["入金", "預入", "振込"],
                "next": "payout_amount"
              },
              {
                "id": "transfer",
                "text": "振込",
                "keywords": ["振込", "送金", "振り込み", "ふりこみ", "送る", "transfer", "移す"],
                "excludeKeywords": [],
                "next": "transfer_country"
              }
            ]
          },
          "deposit_amount": {
            "id": "deposit_amount",
            "type": "input",
            "content": "預入金額を入力してください。",
            "field": "depositAmount",
            "label": "預入金額",
            "next": "deposit_confirmation"
          },
          "deposit_confirmation": {
            "id": "deposit_confirmation",
            "type": "confirmation",
            "content": "預入金額が正しいことを確認してください。",
            "field": "depositAmount",
            "label": "預入金額",
            "next": "transaction_complete"
          },
          "payout_amount": {
            "id": "payout_amount",
            "type": "input",
            "content": "払出金額を入力してください。",
            "field": "payoutAmount",
            "label": "払出金額",
            "next": "payout_limit_check"
          },
          "payout_limit_check": {
            "id": "payout_limit_check",
            "type": "message",
            "content": "20万円以下の場合は払出が可能です。20万円を超える場合は窓口をご利用ください。",
            "next": "payout_confirmation"
          },
          "payout_confirmation": {
            "id": "payout_confirmation",
            "type": "confirmation",
            "content": "払出金額が正しいことを確認してください。",
            "field": "payoutAmount",
            "label": "払出金額",
            "next": "transaction_complete"
          },
          "transfer_country": {
            "id": "transfer_country",
            "type": "choice",
            "content": "お振込先の国を選択してください。",
            "choices": [
              {
                "id": "japan",
                "text": "日本",
                "keywords": ["日本", "にほん", "国内", "こくない", "Japan", "domestic"],
                "excludeKeywords": ["海外", "その他"],
                "next": "financial_institution"
              },
              {
                "id": "others",
                "text": "その他",
                "keywords": ["その他", "海外", "かいがい", "外国", "Others", "international"],
                "excludeKeywords": ["日本", "国内"],
                "next": "transfer_not_available"
              }
            ]
          },
          "financial_institution": {
            "id": "financial_institution",
            "type": "choice",
            "content": "お振込先の金融機関を選択してください。",
            "choices": [
              {
                "id": "mizuho",
                "text": "みずほ銀行",
                "keywords": ["みずほ", "mizuho", "みずほ銀行"],
                "excludeKeywords": [],
                "next": "branch_search_method"
              },
              {
                "id": "mitsubishifj",
                "text": "三菱UFJ銀行",
                "keywords": ["三菱", "UFJ", "三菱UFJ", "mitsubishi"],
                "excludeKeywords": [],
                "next": "branch_search_method"
              },
              {
                "id": "mitsuisumitomo",
                "text": "三井住友銀行",
                "keywords": ["三井住友", "mitsui", "sumitomo"],
                "excludeKeywords": [],
                "next": "branch_search_method"
              },
              {
                "id": "risona",
                "text": "りそな銀行",
                "keywords": ["りそな", "risona"],
                "excludeKeywords": [],
                "next": "branch_search_method"
              },
              {
                "id": "saitamarisona",
                "text": "埼玉りそな銀行",
                "keywords": ["埼玉りそな", "埼玉", "saitama"],
                "excludeKeywords": [],
                "next": "branch_search_method"
              },
              {
                "id": "yuucho",
                "text": "ゆうちょ銀行",
                "keywords": ["ゆうちょ", "郵便局", "yuucho"],
                "excludeKeywords": [],
                "next": "branch_search_method"
              },
              {
                "id": "others",
                "text": "その他",
                "keywords": ["その他", "他の銀行", "others"],
                "excludeKeywords": [],
                "next": "financial_search"
              }
            ]
          },
          "financial_search": {
            "id": "financial_search",
            "type": "message",
            "content": "お振込先の金融機関を検索します。一文字以上入力してください。",
            "next": "branch_search_method"
          },
          "branch_search_method": {
            "id": "branch_search_method",
            "type": "choice",
            "content": "支店名検索方法を選択してください。",
            "choices": [
              {
                "id": "branch_name",
                "text": "支店名",
                "keywords": ["支店名", "名前", "してんめい", "branch name"],
                "excludeKeywords": ["コード", "番号"],
                "next": "branch_name_search"
              },
              {
                "id": "branch_code",
                "text": "支店コード",
                "keywords": ["支店コード", "コード", "番号", "branch code"],
                "excludeKeywords": ["名前"],
                "next": "branch_code_search"
              }
            ]
          },
          "branch_name_search": {
            "id": "branch_name_search",
            "type": "message",
            "content": "支店名で検索します。一文字以上入力してください。",
            "next": "account_number"
          },
          "branch_code_search": {
            "id": "branch_code_search",
            "type": "message",
            "content": "支店コードで検索します。3桁の支店コードを入力してください。",
            "next": "account_number"
          },
          "account_number": {
            "id": "account_number",
            "type": "input",
            "content": "口座番号を入力してください。",
            "field": "accountNumber",
            "label": "口座番号",
            "next": "transfer_amount"
          },
          "transfer_amount": {
            "id": "transfer_amount",
            "type": "input",
            "content": "お振込になる金額を入力してください。",
            "field": "transferAmount",
            "label": "振込金額",
            "next": "transfer_limit_check"
          },
          "transfer_limit_check": {
            "id": "transfer_limit_check",
            "type": "message",
            "content": "20万円以下の場合は振込が可能です。20万円を超える場合は窓口をご利用ください。",
            "next": "transfer_confirmation"
          },
          "transfer_confirmation": {
            "id": "transfer_confirmation",
            "type": "confirmation",
            "content": "振込金額が正しいことをご確認ください。",
            "field": "transferAmount",
            "label": "振込金額",
            "next": "transaction_complete"
          },
          "transfer_not_available": {
            "id": "transfer_not_available",
            "type": "message",
            "content": "ご希望のお取引は当システムでは行っていただけません。窓口をご利用ください。",
            "next": "transaction_complete"
          },
          "transaction_complete": {
            "id": "transaction_complete",
            "type": "message",
            "content": "お手続きが完了いたしました。QRコードを表示いたします。",
            "next": "qr_code_display",
            "voiceFile": "transaction_complete_3"
          },
          "qr_code_display": {
            "id": "qr_code_display", 
            "type": "message",
            "content": "QRコードが表示されました。スマートフォンでスキャンしてお手続きを完了してください。",
            "voiceFile": "qr_code_display_3",
            "next": "thank_you"
          },
          "staff_assistance_amount": {
            "id": "staff_assistance_amount",
            "type": "message", 
            "content": "20万円を超える取引は窓口での対応が必要です。お近くの店員をお呼びください。",
            "next": "call_staff"
          },
          "call_staff": {
            "id": "call_staff",
            "type": "message",
            "content": "店員を呼び出しています。しばらくお待ちください。",
            "next": "end_options"
          },
          "end_options": {
            "id": "end_options",
            "type": "choice",
            "content": "他にご利用になりますか？",
            "choices": [
              {
                "id": "continue",
                "text": "続けて利用する",
                "keywords": ["続ける", "もう一度", "また", "continue", "more", "はい"],
                "excludeKeywords": ["終了", "finish", "いいえ"],
                "next": "transaction_type"
              },
              {
                "id": "finish",
                "text": "終了する",
                "keywords": ["終了", "終わり", "完了", "finish", "end", "done", "いいえ"],
                "excludeKeywords": ["続ける", "continue", "はい"],
                "next": "qr_code_display"
              }
            ]
          },
          "thank_you": {
            "id": "thank_you",
            "type": "message",
            "content": "ありがとうございました。またのご利用をお待ちしております。",
            "voiceFile": "thank_you_3"
          }
        }
      },
      "en": {
        "languageSelection": true,
        "settings": {
          "autoStopSeconds": 3,
          "voiceSpeed": 1.0,
          "qrPassword": "1234",
          "qrExpiryMinutes": 30
        },
        "nodes": {
          "start": {
            "id": "start",
            "type": "message",
            "content": "Welcome to our AI Assistant. Thank you for choosing our service.",
            "next": "language_selection"
          },
          "language_selection": {
            "id": "language_selection",
            "type": "choice",
            "content": "Please select your language.\n言語を選択してください。",
            "choices": [
              {
                "id": "japanese",
                "text": "日本語",
                "keywords": ["Japanese", "日本語", "にほんご", "jp"],
                "excludeKeywords": [],
                "next": "transaction_type"
              },
              {
                "id": "english",
                "text": "English",
                "keywords": ["English", "英語", "えいご", "en"],
                "excludeKeywords": [],
                "next": "transaction_type"
              },
              {
                "id": "chinese",
                "text": "中文",
                "keywords": ["Chinese", "中文", "中国語", "zh"],
                "excludeKeywords": [],
                "next": "transaction_type"
              }
            ]
          },
          "transaction_type": {
            "id": "transaction_type",
            "type": "choice",
            "content": "Please select your desired transaction.",
            "choices": [
              {
                "id": "deposit",
                "text": "Deposit",
                "keywords": ["deposit", "put money", "save", "add funds"],
                "excludeKeywords": ["withdraw", "take out", "transfer"],
                "next": "deposit_amount"
              },
              {
                "id": "payout",
                "text": "Withdrawal",
                "keywords": ["withdrawal", "withdraw", "take out", "get money"],
                "excludeKeywords": ["deposit", "put in", "transfer"],
                "next": "payout_amount"
              },
              {
                "id": "transfer",
                "text": "Transfer",
                "keywords": ["transfer", "send money", "wire transfer"],
                "excludeKeywords": [],
                "next": "transfer_country"
              }
            ]
          },
          "deposit_amount": {
            "id": "deposit_amount",
            "type": "input",
            "content": "Please enter the deposit amount.",
            "field": "depositAmount",
            "label": "Deposit Amount",
            "next": "deposit_confirmation"
          },
          "deposit_confirmation": {
            "id": "deposit_confirmation",
            "type": "confirmation",
            "content": "Please confirm the deposit amount is correct.",
            "field": "depositAmount",
            "label": "Deposit Amount",
            "next": "transaction_complete"
          },
          "payout_amount": {
            "id": "payout_amount",
            "type": "input",
            "content": "Please enter the withdrawal amount.",
            "field": "payoutAmount",
            "label": "Withdrawal Amount",
            "next": "payout_limit_check"
          },
          "payout_limit_check": {
            "id": "payout_limit_check",
            "type": "message",
            "content": "Withdrawals up to ¥200,000 are available. For amounts over ¥200,000, please visit the counter.",
            "next": "payout_confirmation"
          },
          "payout_confirmation": {
            "id": "payout_confirmation",
            "type": "confirmation",
            "content": "Please confirm your withdrawal amount is correct.",
            "field": "payoutAmount",
            "label": "Withdrawal Amount",
            "next": "transaction_complete"
          },
          "transfer_country": {
            "id": "transfer_country",
            "type": "choice",
            "content": "Please select the destination country.",
            "choices": [
              {
                "id": "japan",
                "text": "Japan",
                "keywords": ["Japan", "domestic", "local", "within Japan"],
                "excludeKeywords": ["international", "overseas", "others"],
                "next": "financial_institution"
              },
              {
                "id": "others",
                "text": "Others",
                "keywords": ["Others", "international", "overseas", "abroad", "foreign"],
                "excludeKeywords": ["Japan", "domestic"],
                "next": "transfer_not_available"
              }
            ]
          },
          "financial_institution": {
            "id": "financial_institution",
            "type": "choice",
            "content": "Please select the destination financial institution.",
            "choices": [
              {
                "id": "mizuho",
                "text": "Mizuho Bank",
                "keywords": ["Mizuho", "みずほ"],
                "excludeKeywords": [],
                "next": "branch_search_method"
              },
              {
                "id": "mitsubishifj",
                "text": "MUFG Bank",
                "keywords": ["MUFG", "Mitsubishi", "UFJ", "三菱"],
                "excludeKeywords": [],
                "next": "branch_search_method"
              },
              {
                "id": "mitsuisumitomo",
                "text": "Sumitomo Mitsui Banking",
                "keywords": ["Sumitomo", "Mitsui", "三井住友"],
                "excludeKeywords": [],
                "next": "branch_search_method"
              },
              {
                "id": "risona",
                "text": "Resona Bank",
                "keywords": ["Resona", "りそな"],
                "excludeKeywords": [],
                "next": "branch_search_method"
              },
              {
                "id": "saitamarisona",
                "text": "Saitama Resona Bank",
                "keywords": ["Saitama", "埼玉"],
                "excludeKeywords": [],
                "next": "branch_search_method"
              },
              {
                "id": "yuucho",
                "text": "Japan Post Bank",
                "keywords": ["Japan Post", "Yucho", "ゆうちょ"],
                "excludeKeywords": [],
                "next": "branch_search_method"
              },
              {
                "id": "others",
                "text": "Others",
                "keywords": ["Others", "other bank"],
                "excludeKeywords": [],
                "next": "financial_search"
              }
            ]
          },
          "financial_search": {
            "id": "financial_search",
            "type": "message",
            "content": "Search for destination financial institution. Please enter at least one character.",
            "next": "branch_search_method"
          },
          "branch_search_method": {
            "id": "branch_search_method",
            "type": "choice",
            "content": "Please select branch search method.",
            "choices": [
              {
                "id": "branch_name",
                "text": "Branch Name",
                "keywords": ["branch name", "name", "by name"],
                "excludeKeywords": ["code", "number"],
                "next": "branch_name_search"
              },
              {
                "id": "branch_code",
                "text": "Branch Code",
                "keywords": ["branch code", "code", "number", "by code"],
                "excludeKeywords": ["name"],
                "next": "branch_code_search"
              }
            ]
          },
          "branch_name_search": {
            "id": "branch_name_search",
            "type": "message",
            "content": "Search by branch name. Please enter at least one character.",
            "next": "account_number"
          },
          "branch_code_search": {
            "id": "branch_code_search",
            "type": "message",
            "content": "Search by branch code. Please enter the 3-digit branch code.",
            "next": "account_number"
          },
          "account_number": {
            "id": "account_number",
            "type": "input",
            "content": "Please enter the account number.",
            "field": "accountNumber",
            "label": "Account Number",
            "next": "transfer_amount"
          },
          "transfer_amount": {
            "id": "transfer_amount",
            "type": "input",
            "content": "Please enter the transfer amount.",
            "field": "transferAmount",
            "label": "Transfer Amount",
            "next": "transfer_limit_check"
          },
          "transfer_limit_check": {
            "id": "transfer_limit_check",
            "type": "message",
            "content": "Transfers up to ¥200,000 are available. For amounts over ¥200,000, please visit the counter.",
            "next": "transfer_confirmation"
          },
          "transfer_confirmation": {
            "id": "transfer_confirmation",
            "type": "confirmation",
            "content": "Please confirm your transfer amount is correct.",
            "field": "transferAmount",
            "label": "Transfer Amount",
            "next": "transaction_complete"
          },
          "transfer_not_available": {
            "id": "transfer_not_available",
            "type": "message",
            "content": "This transaction is not available on this system. Please visit the counter.",
            "next": "transaction_complete"
          },
          "transaction_complete": {
            "id": "transaction_complete",
            "type": "message",
            "content": "Your transaction has been completed. Displaying QR code.",
            "next": "qr_code_display"
          },
          "qr_code_display": {
            "id": "qr_code_display", 
            "type": "message",
            "content": "QR code is displayed. Please scan with your smartphone to complete the procedure.",
            "next": "end_options"
          },
          "staff_assistance_amount": {
            "id": "staff_assistance_amount",
            "type": "message", 
            "content": "Transactions over ¥200,000 require counter service. Please call a staff member.",
            "next": "call_staff"
          },
          "call_staff": {
            "id": "call_staff",
            "type": "message",
            "content": "Calling staff. Please wait a moment.",
            "next": "end_options"
          },
          "end_options": {
            "id": "end_options",
            "type": "choice",
            "content": "Would you like to make another transaction?",
            "choices": [
              {
                "id": "continue",
                "text": "Continue using",
                "keywords": ["continue", "more", "another", "again", "yes"],
                "excludeKeywords": ["finish", "end", "no"],
                "next": "transaction_type"
              },
              {
                "id": "finish",
                "text": "Finish",
                "keywords": ["finish", "end", "done", "complete", "exit", "no"],
                "excludeKeywords": ["continue", "more", "yes"],
                "next": "qr_code_display"
              }
            ]
          },
          "thank_you": {
            "id": "thank_you",
            "type": "message",
            "content": "Thank you for using our service. We look forward to serving you again."
          }
        }
      }
    }
  }
  
  return fallbackFlow
}