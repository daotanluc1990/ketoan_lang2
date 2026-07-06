# Safety — ketoan_lang2 Loop

> Bổ sung cho `AGENTS.md` (v2.0.0) và `loop-constraints.md`. Áp dụng cho mọi loop chạy trong repo này.
> Owner là non-technical → mọi output phải dễ hiểu, mọi hành động nguy hiểm phải qua cổng phê duyệt.

## Nguyên tắc gốc (từ AGENTS.md)

Loop kế thừa toàn bộ quy tắc của `AGENTS.md`, đặc biệt:

- **Do not code too early** (Section 4) — L1 loop chỉ báo cáo, không viết code.
- **Stop Conditions** (Section 13) — dừng và hỏi owner khi: schema Google Sheets có thể đổi, RBAC/data access không rõ, secret bị lộ, deploy target không rõ, test fail cần fix rộng.
- **Forbidden files** — owner phải duyệt trước khi đổi.
- **No `git add .`** (Section: Git Safety) — chỉ add file cụ thể, sau khi đã quét secret.

## Cấp độ loop

| Cấp | Loop được làm gì | Cổng con người |
|------|------------------|----------------|
| **L1** *(hiện tại)* | Chỉ đọc + ghi report vào `STATE.md`. Không sửa code, không commit code (trừ STATE.md). | Owner đọc STATE.md mỗi sáng. |
| **L2** | Đề xuất fix nhỏ trong worktree + verifier sub-agent. | Owner duyệt từng PR trước khi ready. |
| **L3** | Chạy không giám sát. | **Chưa bật** với repo này. RBAC + Google Sheets integration + Telegram notify khiến L3 rủi ro cao. |

## Danh sách cấm (denylist)

Loop KHÔNG được phép (ở mọi cấp, trừ khi owner phê duyệt rõ ràng):

- Đọc hoặc in giá trị của `.env`, `.env.*`, `GOOGLE_PRIVATE_KEY`, `*_API_KEY`, `*_TOKEN`.
- Sửa: `.env*`, `vercel.json`, `schema.json`, `scripts/`, `templates/`, `AGENTS.md`, `docs/safety.md`, `loop-constraints.md`, `loop-budget.md`.
- Sửa bất cứ thứ gì dưới `auth/`, `payments/`, `secrets/`, `credentials/` (nếu có).
- Chạy `npm run build`, `npm run deploy`, lệnh Vercel, hoặc bất cứ lệnh deploy/production nào.
- Tắt test, weaken RBAC, broad refactor, hoặc đổi Google Sheets schema.
- `git add .` / `git add -A` — luôn add path cụ thể, sau khi đã check secret.
- Đóng issue/PR, push lên main, hoặc merge mà không có phê duyệt.

## Cổng phê duyệt (human gates)

Bắt buộc dừng và hỏi owner khi loop chạm:

- **Security / auth / RBAC** — phân quyền, role, basic auth.
- **Dữ liệu nhạy cảm** — Google Sheets schema, financial data, PII.
- **Thanh toán** — bất kỳ thứ gì dính payments.
- **Infra / deploy** — env, Vercel, webhook, Telegram bot config.
- **Diff lớn hoặc đa file** — architectural change.
- **Mập mờ** — khi loop không chắc, escalate, không đoán.

## MCP / Connectors

- **L1**: không cần MCP. Workflow `daily-triage.yml` chỉ dùng `GITHUB_TOKEN` mặc định + `GEMINI_API_KEY`.
- **L2+**: GitHub MCP chỉ scope **read + comment** cho đến khi được trust. Không cấp write cho đến khi có phê duyệt rõ ràng.
- Secrets lưu trong **GitHub Actions secrets**, không bao giờ commit vào repo.

## Budget & kill switch

- Daily cap mặc định: **100k tokens** (xem `loop-budget.md`).
- Khi spend đạt 80% daily cap → tự chuyển sang report-only.
- **Kill switch**: tạo issue/commit với label `loop-pause-all`. Loop phải exit ngay lập tức khi thấy flag này trong `STATE.md` hoặc issues.
- Resume chỉ khi owner xoá flag trong `STATE.md`.

## Báo cáo sự cố

Nếu loop làm sai (commit nhầm, sửa file cấm, leak secret):

1. Owner chạy `loop-pause-all` ngay (label issue hoặc ghi vào STATE.md).
2. `git revert` commit sai, không force push.
3. Nếu secret bị commit → xoá khỏi history + rotate key (Gemini/OpenAI/Telegram/Google).
4. Ghi sự cố vào `loop-run-log.md` dưới mục **Incidents**.
