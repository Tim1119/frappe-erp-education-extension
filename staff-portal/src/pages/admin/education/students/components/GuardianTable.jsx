import { useEffect, useState } from "react";
import { getGuardians } from "@/services/studentService";

export default function GuardianTable({ value = [], onChange }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getGuardians();

    setOptions(data || []);
  }

  function addRow() {
    onChange([
      ...value,
      {
        guardian: "",
        relation: "",
      },
    ]);
  }

  function removeRow(index) {
    onChange(value.filter((_, i) => i !== index));
  }

  function updateRow(index, key, val) {
    const rows = [...value];

    rows[index][key] = val;

    onChange(rows);
  }

  return (
    <div>
      <table className="tbl">
        <thead>
          <tr>
            <th>Guardian</th>
            <th>Relation</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {value.map((row, index) => (
            <tr key={index}>
              <td>
                <select
                  className="select"

                  value={row.guardian}

                  onChange={(e) => updateRow(index, "guardian", e.target.value)}
                >
                  <option value="">Select Guardian</option>

                  {options.map((g) => (
                    <option key={g.name} value={g.name}>
                      {g.guardian_name}
                    </option>
                  ))}
                </select>
              </td>

              <td>
                <select
                  className="select"

                  value={row.relation}

                  onChange={(e) => updateRow(index, "relation", e.target.value)}
                >
                  <option value="">Select Relation</option>

                  <option>Father</option>

                  <option>Mother</option>

                  <option>Others</option>
                </select>
              </td>

              <td>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removeRow(index)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button type="button" className="btn btn-secondary" onClick={addRow}>
        Add Guardian
      </button>
    </div>
  );
}
