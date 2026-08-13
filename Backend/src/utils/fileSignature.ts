import fs from "fs";

// Magic-byte (file signature) check, independent of file extension or the
// client-supplied Content-Type — both are attacker-controlled and were
// verified during the security audit to be spoofable (a `<script>` payload
// saved with a `.jpg` extension passed the extension-only filter).
const SIGNATURES: Record<string, (buf: Buffer) => boolean> = {
    ".jpg": buf => buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
    ".jpeg": buf => buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
    ".png": buf =>
        buf.length >= 8 &&
        buf[0] === 0x89 &&
        buf[1] === 0x50 &&
        buf[2] === 0x4e &&
        buf[3] === 0x47 &&
        buf[4] === 0x0d &&
        buf[5] === 0x0a &&
        buf[6] === 0x1a &&
        buf[7] === 0x0a,
    ".webp": buf =>
        buf.length >= 12 &&
        buf.toString("ascii", 0, 4) === "RIFF" &&
        buf.toString("ascii", 8, 12) === "WEBP",
};

export const hasValidImageSignature = (filePath: string, ext: string): boolean => {
    const check = SIGNATURES[ext.toLowerCase()];
    if (!check) {
        return false;
    }
    const fd = fs.openSync(filePath, "r");
    try {
        const buffer = Buffer.alloc(12);
        const bytesRead = fs.readSync(fd, buffer, 0, 12, 0);
        return check(buffer.subarray(0, bytesRead));
    } finally {
        fs.closeSync(fd);
    }
};
