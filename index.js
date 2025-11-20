import makeWASocket, {
    useMultiFileAuthState,
    downloadMediaMessage,
    DisconnectReason
} from "@whiskeysockets/baileys";

import { PDFDocument } from "pdf-lib";
import qrcode from "qrcode-terminal";
import fs from "fs";
import { Boom } from "@hapi/boom";

const userState = {};

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: ["Chrome", "Desktop", "10.0"],
        syncFullHistory: false
    });

    sock.ev.on("creds.update", saveCreds);

    // === QR HANDLER ===
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("QR CODE MUNCUL, SCAN YA BOSS...");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "close") {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode;

            if (reason === DisconnectReason.loggedOut) {
                console.log("Akun logout. Menghapus auth dan restart...");
                fs.rmSync("./auth", { recursive: true, force: true });
                start();
            } else {
                console.log("Koneksi terputus, mencoba reconnect...");
                start();
            }

        } else if (connection === "open") {
            console.log("Connected. All green.");
        }
    });

    // === MESSAGE HANDLER ===
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        if (!userState[from]) {
            userState[from] = { mode: null, images: [] };
        }

        // === GAMBAR DITERIMA ===
        if (msg.message.imageMessage) {
            userState[from].mode = "collecting";
            userState[from].images.push(msg);

            await sock.sendMessage(from, {
                text: `Gambar diterima (${userState[from].images.length}). Ketik *Selesai* untuk membuat PDF.`
            });

            return;
        }

        // === USER KETIK SELESAI ===
        if (text?.toLowerCase() === "selesai" && userState[from].mode === "collecting") {
            userState[from].mode = "title";

            await sock.sendMessage(from, {
                text: "Masukkan nama PDF:"
            });

            return;
        }

        // === TERIMA NAMA PDF ===
        if (userState[from].mode === "title") {
            const pdfName = text.trim().replace(/[^a-zA-Z0-9 \-_]/g, "");

            if (!pdfName) {
                await sock.sendMessage(from, {
                    text: "Nama PDF tidak valid. Masukkan yang benar."
                });
                return;
            }

            await sock.sendMessage(from, {
                text: `Sedang membuat PDF **${pdfName}.pdf**...`
            });

            try {
                const pdf = await PDFDocument.create();

                for (const imgMsg of userState[from].images) {
                    const buffer = await downloadMediaMessage(
                        imgMsg,
                        "buffer",
                        {},
                        { reuploadRequest: sock }
                    );

                    if (!buffer) continue;

                    const jpg = await pdf.embedJpg(buffer);
                    const page = pdf.addPage([jpg.width, jpg.height]);

                    page.drawImage(jpg, {
                        x: 0,
                        y: 0,
                        width: jpg.width,
                        height: jpg.height
                    });
                }

                const pdfBytes = await pdf.save();

                await sock.sendMessage(from, {
                    document: Buffer.from(pdfBytes),
                    fileName: `${pdfName}.pdf`,
                    mimetype: "application/pdf"
                });

            } catch (e) {
                console.error(e);
                await sock.sendMessage(from, {
                    text: "Terjadi error saat membuat PDF."
                });
            }

            userState[from] = { mode: null, images: [] };
            return;
        }
    });

    return sock;
}

start();