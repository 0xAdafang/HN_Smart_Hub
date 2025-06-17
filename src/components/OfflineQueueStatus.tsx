import { useEffect, useState } from "react";
import { getQueue, removeFromQueue } from "../utils/offlineQueue";
import { invoke } from "@tauri-apps/api/core";
import { RefreshCcw, PackageOpen } from "lucide-react";
import { UploadCloud } from "lucide-react";

export default function OfflineQueueStatus() {
  const [queue, setQueue] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const fetchQueue = async () => {
    const q = await getQueue();
    setQueue(q);
  };

  const synchronizeNow = async () => {
    setSyncing(true);
    setMessage(null);
    const queue = await getQueue();
    let successCount = 0;

    for (const item of queue) {
      try {
        const res = await invoke("save_offline_action", { payload: item });
        if (res === "ok") {
          await removeFromQueue(item.id);
          successCount++;
        }
      } catch (e) {
        console.warn("❌ Synchronisation échouée pour :", item, e);
      }
    }

    await fetchQueue();
    setMessage(`🔁 ${successCount} action(s) synchronisée(s).`);
    setSyncing(false);
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="bg-white dark:bg-zinc-800 text-sm text-black dark:text-white border border-zinc-300 dark:border-zinc-600 rounded p-4 shadow-lg w-72 transition-all">
          <p className="font-semibold mb-2">
            File offline : {queue.length} action(s)
          </p>
          {queue.length > 0 && (
            <ul className="list-disc pl-5 text-xs mb-2">
              {queue.map((item, i) => (
                <li key={i}>
                  <code>{item.type}</code>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={synchronizeNow}
            disabled={syncing}
            className="w-full px-3 py-1 bg-bioGreen hover:bg-green-700 text-white rounded transition flex items-center justify-center gap-2"
          >
            <RefreshCcw size={14} />
            {syncing ? "Synchronisation..." : "Forcer la synchro"}
          </button>
          {message && (
            <p className="mt-2 text-green-600 dark:text-green-400">{message}</p>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="rounded-full bg-bioGreen hover:bg-green-700 text-white w-13 h-13 shadow-md flex items-center justify-center"
        title="File offline"
      >
        <UploadCloud size={20} />
      </button>
    </div>
  );
}
